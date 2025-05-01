const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const marked = require('marked');
const cors = require('cors');

require('dotenv').config();

const app = express();
const CONTENT_DIR = process.env.CONTENT_DIR || path.join(__dirname, 'src/content');
const port = process.env.PORT || 3001;

app.use(cors());

app.get('/api/pages', async (req, res) => {
    const getRoutes = async (dir = '') => {
      const fullPath = path.join(CONTENT_DIR, dir);
      const files = await fs.readdir(fullPath);
  
      const routes = [];
  
      for (const file of files) {
        const filePath = path.join(fullPath, file);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
          const nestedRoutes = await getRoutes(path.join(dir, file));
          routes.push(...nestedRoutes);
        } else if (file.endsWith('index.md')) {
          routes.push(path.join(dir, file.replace('index.md', '')));
        }
      }
      return routes;
    };
  
    const routes = await getRoutes();
    res.json(routes);
  });

  app.get('/api/pages/*splat', async (req, res) => {
    const routePath = req.path.replace('/api/pages/', '');
    const mdFile = path.join(CONTENT_DIR, `${routePath}/index.md`);

    if (!fs.existsSync(mdFile)) return res.status(404).send('Not found');

    const fileContent = await fs.readFile(mdFile, 'utf-8');
    const { content } = matter(fileContent);
    const htmlPageContent = marked.parse(content);

    const template = await fs.readFile(path.join(__dirname, 'src/template.html'), 'utf-8');
    const htmlTemplate = template.replace('{{content}}', htmlPageContent);

    res.json(htmlTemplate);
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  
  module.exports = app;
  