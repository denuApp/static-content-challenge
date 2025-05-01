import express from 'express';
import { readdir, stat as _stat, existsSync, readFile } from 'fs-extra';
import { join } from 'path';
import matter from 'gray-matter';
import { parse } from 'marked';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const CONTENT_DIR = process.env.CONTENT_DIR || join(__dirname, 'src/content');
const port = process.env.PORT || 3001;

app.use(cors());

app.get('/api/pages', async (req, res) => {
    const getRoutes = async (dir = '') => {
      const fullPath = join(CONTENT_DIR, dir);
      const files = await readdir(fullPath);
  
      const routes = [];
  
      for (const file of files) {
        const filePath = join(fullPath, file);
        const stat = await _stat(filePath);
        if (stat.isDirectory()) {
          const nestedRoutes = await getRoutes(join(dir, file));
          routes.push(...nestedRoutes);
        } else if (file.endsWith('index.md')) {
          routes.push(join(dir, file.replace('index.md', '')));
        }
      }
      return routes;
    };
  
    const routes = await getRoutes();
    res.json(routes);
  });

  app.get('/api/pages/*splat', async (req, res) => {
    const routePath = req.path.replace('/api/pages/', '');
    const mdFile = join(CONTENT_DIR, `${routePath}/index.md`);

    if (!existsSync(mdFile)) return res.status(404).send('Not found');

    const fileContent = await readFile(mdFile, 'utf-8');
    const { content } = matter(fileContent);
    const htmlPageContent = parse(content);

    const template = await readFile(join(__dirname, 'src/template.html'), 'utf-8');
    const htmlTemplate = template.replace('{{content}}', htmlPageContent);

    res.json(htmlTemplate);
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  
  export default app;
  