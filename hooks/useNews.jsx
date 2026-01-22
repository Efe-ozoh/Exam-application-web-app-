"use client";

import { useEffect, useState } from "react";
import { fetchNews } from "@/lib/serverRequests";

const useNews = () => {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getNews = async () => {
      try {

        const data = await fetchNews();
        setNews(data);

      } catch (err) {

        console.error("Error fetching news:", err);
        setError(err);

      } finally {

        setLoading(false);
      }
    };

    getNews();
  }, []);
  
  return { news, loading, error };
};

export default useNews;
