import Image from "next/image";

export default function CommunityBanner() {
  return (
    <section className="px-12 pt-16">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl">
        <Image
          src="/marketing/community.png"
          alt="A group of students together with laptops and notebooks, mid-conversation"
          width={1680}
          height={640}
          className="h-auto w-full object-cover"
          sizes="(min-width: 1152px) 1152px, 100vw"
        />
      </div>
    </section>
  );
}
