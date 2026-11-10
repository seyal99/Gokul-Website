import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import MarkdownIt from 'markdown-it'

const moduleId = 'virtual:blogs'
const resolvedId = '\0' + moduleId
const arrow = '<svg class="dot-arrow" viewBox="0 0 40 40" aria-hidden="true">' +
  ['000001000', '000000100', '000000010', '111111111', '000000010', '000000100', '000001000']
    .flatMap((row, y) => [...row].flatMap((cell, x) => cell === '1' ? [`<circle cx="${4 + x * 4}" cy="${8 + y * 4}" r="1.25" fill="currentColor"/>`] : [])).join('') + '</svg>'
const markdown = new MarkdownIt({ html: false })
markdown.renderer.rules.link_close = () => `${arrow}</a>`
// A post already has its title outside the Markdown body.
markdown.renderer.rules.heading_open = (tokens, index) => `<${tokens[index].tag === 'h1' ? 'h2' : tokens[index].tag}>`
markdown.renderer.rules.heading_close = (tokens, index) => `</${tokens[index].tag === 'h1' ? 'h2' : tokens[index].tag}>\n`

function readPosts(directory, includeDrafts, categories) {
  if (!existsSync(directory)) return []
  return readdirSync(directory).filter(file => file.endsWith('.md') && !file.startsWith('_')).flatMap(file => {
    const slug = file.slice(0, -3)
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Blog filename must use lowercase words separated by hyphens: ${file}`)
    const source = readFileSync(resolve(directory, file), 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
    const match = source.match(/^---\n([\s\S]*?)\n---(?:\n|$)/)
    if (!match) throw new Error(`Missing blog metadata in ${file}. Copy _template.md to start a post.`)
    const metadata = {}
    for (const line of match[1].split('\n').filter(line => line.trim() && !line.trim().startsWith('#'))) {
      const field = line.match(/^(title|date|description|category|draft):\s*(.*?)\s*$/)
      if (!field) throw new Error(`Invalid metadata line in ${file}: ${line}. Use one-line title, date, description, category and draft fields.`)
      metadata[field[1]] = field[2].replace(/^(["'])(.*)\1$/, '$2')
    }
    if (metadata.draft && !['true', 'false'].includes(metadata.draft)) throw new Error(`draft must be true or false in ${file}`)
    if (metadata.draft === 'true' && !includeDrafts) return []
    if (!categories.some(category => category.slug === metadata.category)) {
      throw new Error(`Blog post ${file} needs a category: ${categories.map(category => category.slug).join(', ')}`)
    }
    if (!metadata.title || !metadata.description || !/^\d{4}-\d{2}-\d{2}$/.test(metadata.date || '') ||
      !Number.isFinite(Date.parse(metadata.date)) || new Date(metadata.date).toISOString().slice(0, 10) !== metadata.date) {
      throw new Error(`Blog post needs a title, description and valid YYYY-MM-DD date: ${file}`)
    }
    const body = source.slice(match[0].length).trim()
    if (!body) throw new Error(`Blog post body is empty: ${file}`)
    return [{ slug, category: metadata.category, title: metadata.title, date: metadata.date, description: metadata.description, draft: metadata.draft === 'true', html: markdown.render(body) }]
  }).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
}

const escapeAttribute = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))

export function blogPlugin() {
  let directory
  let categoryFile
  let isDev = false
  const readCategories = () => JSON.parse(readFileSync(categoryFile, 'utf8'))
  return {
    name: 'portfolio-blogs',
    configResolved(config) {
      directory = resolve(config.root, 'src/content/blogs')
      categoryFile = resolve(config.root, 'src/data/blog-categories.json')
      isDev = config.command === 'serve'
    },
    resolveId(id) { if (id === moduleId) return resolvedId },
    load(id) {
      if (id === resolvedId) return `export default ${JSON.stringify(readPosts(directory, isDev, readCategories()))}`
    },
    configureServer(server) {
      // Direct article URLs use the same Vue entry in development.
      server.middlewares.use((request, response, next) => {
        if (/^\/blogs\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)?\/?(?:\?|$)/.test(request.url || '')) request.url = '/blogs/index.html'
        next()
      })
      server.watcher.add([directory, categoryFile])
      const reload = file => {
        if (resolve(file) !== categoryFile && (!file.startsWith(directory + sep) || !file.endsWith('.md'))) return
        const module = server.moduleGraph.getModuleById(resolvedId)
        if (module) server.moduleGraph.invalidateModule(module)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', reload).on('change', reload).on('unlink', reload)
      server.httpServer?.once('close', () => {
        for (const event of ['add', 'change', 'unlink']) server.watcher.off(event, reload)
      })
    },
    generateBundle: {
      order: 'post',
      handler(options, bundle) {
        const archive = bundle['blogs/index.html']
        if (!archive) throw new Error('Blogs HTML entry was not built.')
        const categories = readCategories()
        const pages = [
          ...categories.map(category => ({ ...category, path: `blogs/${category.slug}/index.html` })),
          ...readPosts(directory, false, categories).map(post => ({ ...post, path: `blogs/${post.category}/${post.slug}/index.html` })),
        ]
        for (const post of pages) {
          const html = String(archive.source)
            .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeAttribute(post.title)} — Gokul Raju</title>`)
            .replace(/<meta name="description" content="[^"]*">/, () => `<meta name="description" content="${escapeAttribute(post.description)}">`)
          this.emitFile({ type: 'asset', fileName: post.path, source: html })
        }
      },
    },
  }
}
