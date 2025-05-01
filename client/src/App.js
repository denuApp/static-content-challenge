import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function App() {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);

  const getAllPages = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/pages`);
      const {data} = response;
      const pages = data.map(page => {
        return {
          label: page.replace(/-/g, ' ').replace(/\//g, ' '),
          value: page
        }
      });
      setPages(pages);
      return pages;
    } catch (error) {
      console.error('Error fetching content:', error);
      return [];
    }
  }

  const handlePageClick = async (page) => {
    try {
      const html = await axios.get(`${API_URL}/api/pages/${page}`);
      const parser = new DOMParser();
      const doc = parser.parseFromString(html.data, "text/html");

      const title = doc.querySelector("title")?.textContent;
      if (title) {
        document.title = title;
      }

      const body = doc.body.innerHTML;
      setSelectedPage({
        page: page,
        body: body
      });
    } catch (error) {
      console.error('Error fetching page content:', error);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const pages = await getAllPages();
      if (pages.length > 0) {
        handlePageClick(pages[0].value);
      }
    };
    loadInitialData();
  }, []);

  return (
    <div className="min-h-screen bg-orange-200">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-orange-400">Acme Co.</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0 flex flex-row gap-10">
            {/* sidebar */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white shadow rounded-lg p-4 h-[calc(100vh-12rem)] overflow-y-auto">
                <div className="grid grid-cols-1 gap-4">
                  {pages.map((page, index) => (
                    <div 
                      key={index} 
                      className={`cursor-pointer hover:bg-orange-100 p-2 rounded transition-colors duration-200 ${selectedPage && selectedPage.page === page.value ? ' bg-orange-200' : ''}`}
                      onClick={() => handlePageClick(page.value)}
                    >
                      <h2 className="text-lg font-medium text-gray-500">{page.label}</h2>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* main content */}
            {selectedPage && (
              <div className="bg-white shadow rounded-lg p-6 flex h-[calc(100vh-12rem)] w-full">
                <div
                  className="prose  p-4 prose-h1:text-orange-400"
                  dangerouslySetInnerHTML={{ __html: selectedPage.body }}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
