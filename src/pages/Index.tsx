
import GradientHeader from "@/components/GradientHeader";
import Pixelate from "@/components/Pixelate";

const Index = () => {


  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <GradientHeader
      />

      <div className="container mx-auto max-w-screen-xl flex-row flex gap-5 justify-between px-4 py-8 flex-1">

        <div className="flex flex-col gap-4">
          <Pixelate className="text-6xl font-regular mb-2 text-left pixel">
            Ship quality at scale.
          </Pixelate>
          <p className="opacity-80 text-2xl">Review smart. Merge fast. Ship better.</p>

          <p className="opacity-50 text-lg mt-8 max-w-2xl">CodeLens brings instant insight to your codebase. Spot issues, track changes, and review with confidence. Because clean code isn&apos;t a luxury — it&apos;s a standard.</p>
          <a href="/review" className="text-black px-7 py-3 hover:px-9 transition-all duration-150 w-fit rounded-full mt-4 font-semibold bg-[#8872df]"><Pixelate className="">Let&apos;s review</Pixelate></a>
        </div>

        <img src="/scan.svg" alt="scan" className=" w-[250px] h-[250px] object-cover opacity-70 z-5" />
      </div>


      <img src="/review.png" alt="bg" className="object-cover rounded-2xl mt-12 border-4 border-[#8872df]/40 max-w-screen-xl mx-auto z-0" />
    </div>
  );
};

export default Index;
