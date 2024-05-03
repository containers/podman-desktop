import React from 'react';

function Banner(): JSX.Element {
  
  return <div className="w-full flex flex-row justify-center items-center py-4 bg-purple-700 overflow-hidden">
    <div className="bg-[#fcd34d] rounded-xl text-black px-3 py-1">NEW FEATURE</div>
    <div className="mx-3 relative text-white">We have a new <span className="font-bold text-lg">Podman AI Lab</span> extension! <a href="/extensions/ai-lab" className="underline text-white">Check it out here.</a>
    <img
            className="w-16 absolute -right-32 -top-1 -rotate-12"
            alt="Podman AI Lab"
            src="img/banner/podman-ai-lab-icon.png"
          /></div>
    </div>;
}

export default Banner;
