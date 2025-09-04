import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  return (
    <section className="flex flex-col md:flex-row items-center justify-between px-10 py-14 mt-6 max-w-7xl mx-auto min-h-[calc(100vh-90px-64px)]">
      <div className="flex-1">
        <h1 className="serif-heading text-5xl font-extrabold text-[#22223B] mb-7 leading-tight">
          Clothes That Get <span className="text-[#2563eb]">YOU</span> Noticed
        </h1>
        <p className="text-lg text-[#51546E] mb-7 max-w-xl">
          Fashion is part of the daily air and it does not quite help that it changes all the time.
          Clothes have always been a marker of the era and we are in a revolution.
          Your fashion makes you seen and heard the way you are.
          So, celebrate the season's new and exciting fashion in your own way.
        </p>
        <button
          className="bg-[#2563eb] text-white font-semibold py-3 px-8 rounded-md text-lg hover:bg-blue-800 transition shadow-md"
          onClick={() => navigate("/products")}
        >
          Shop Now
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center relative mt-10 md:mt-0">
        <div className="rounded-2xl overflow-hidden shadow-2xl w-[340px] h-[420px] bg-[#bfdbfe] flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80"
            alt="Fashion model sitting"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="absolute left-0 bottom-[-45px] rounded-xl overflow-hidden shadow-xl w-[160px] h-[110px] bg-[#bfdbfe] border-4 border-white">
          <img
            src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80"
            alt="Shopping bags"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="absolute left-[115px] bottom-[-40px] rounded-xl overflow-hidden shadow-xl w-[125px] h-[105px] bg-[#bfdbfe] border-4 border-white">
          <img
            src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80"
            alt="Fashion shopping"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </section>
  );
}

export default Home;