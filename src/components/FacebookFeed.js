"use client";

import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Spinner from "./spinner/Spinner";

const FacebookFeed = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get("/api/facebook/feed", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setPosts(data.data || []);
    } catch (err) {
      console.error("Error fetching Facebook posts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <section className="mt-12 px-4 md:px-16 lg:px-24">
      <h2 className="text-center text-3xl md:text-4xl font-bold mb-8 font-bebas-neue">
        Les Actualités
      </h2>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-shadow duration-300"
            >
              {post.full_picture && (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.full_picture}
                    alt="Post image"
                    width={600}
                    height={400}
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6 ">
                <p className="text-gray-800 text-base max-h-30 overflow-hidden line-clamp-3 ">
                  {post.message}
                </p>
                <div className=" flex items-center justify-between pt-4 border-t border-gray-200 mt-2">
                  <time className="text-gray-500 text-sm">
                    {formatDate(post.created_time)}
                  </time>
                  <a
                    href={`https://facebook.com/${post.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Voir sur Facebook →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default FacebookFeed;
