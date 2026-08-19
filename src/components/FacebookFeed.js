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

      setPosts((data.data || []).slice(0, 6));
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

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <section className="mt-12 px-4 md:px-12 lg:px-20">
      <h2 className="font-bebas-neue md:text-6xl text-3xl text-center mb-8 uppercase">
        LES DERNIÈRES NOUVELLES
      </h2>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-12">
          {featuredPost && (
            <article
              key={featuredPost.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 flex flex-col lg:flex-row lg:min-h-[450px]"
            >
              {featuredPost.full_picture && (
                <div className="relative w-full lg:w-[30%] h-80 sm:h-96 lg:h-auto overflow-hidden shrink-0">
                  <Image
                    src={featuredPost.full_picture}
                    alt="Image de la publication"
                    fill
                    unoptimized
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-brand text-black font-bebas-neue tracking-widest text-sm px-4 py-1.5 rounded-lg shadow-md uppercase z-10">
                    À la une
                  </div>
                </div>
              )}
              <div className={`p-8 lg:p-12 flex flex-col justify-between flex-1 ${!featuredPost.full_picture ? 'w-full' : ''}`}>
                <div className="space-y-4">
                  <time className="text-brand-dark text-sm font-semibold tracking-wider block uppercase">
                    {formatDate(featuredPost.created_time)}
                  </time>
                  <p className="text-gray-800 text-lg md:text-xl font-medium leading-relaxed line-clamp-6 lg:line-clamp-none whitespace-pre-wrap">
                    {featuredPost.message}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
                  <a
                    href={`https://facebook.com/${featuredPost.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-black hover:text-brand-dark font-bebas-neue text-lg tracking-wider transition-colors"
                  >
                    Voir sur Facebook <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </a>
                </div>
              </div>
            </article>
          )}

          {remainingPosts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 pt-6">
              {remainingPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden group hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
                >
                  <div>
                    {post.full_picture && (
                      <div className="relative h-48 sm:h-56 overflow-hidden">
                        <Image
                          src={post.full_picture}
                          alt="Image de la publication"
                          width={600}
                          height={400}
                          unoptimized
                          className="object-cover object-center h-full w-full transform group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <p className="text-gray-600 text-sm line-clamp-3 whitespace-pre-line">
                        {post.message}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <time className="text-gray-400 text-xs">
                        {formatDate(post.created_time)}
                      </time>
                      <a
                        href={`https://facebook.com/${post.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-dark text-xs font-semibold hover:underline"
                      >
                        Voir sur Facebook →
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default FacebookFeed;
