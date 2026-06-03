const PHOTOS = [
  { id: '1', src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', alt: 'Mountain road' },
  { id: '2', src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80', alt: 'Waterfall mist' },
  { id: '3', src: 'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=400&q=80', alt: 'Bar scene' },
  { id: '4', src: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80', alt: 'Desk setup' },
  { id: '5', src: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=400&q=80', alt: 'Deep ocean' },
  { id: '6', src: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80', alt: 'Typewriter' },
  { id: '7', src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80', alt: 'City rooftops' },
  { id: '8', src: 'https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?w=400&q=80', alt: 'VW bus' },
  { id: '9', src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80', alt: 'Forest mist' },
  { id: '10', src: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80', alt: 'Night street' },
  { id: '12', src: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80', alt: 'Minimal desk' },
];

type PhotoCollageProps = {
  title?: string;
};

export function PhotoCollage({ title = 'Your Photos' }: PhotoCollageProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <span className="text-sm text-muted-foreground">{PHOTOS.length} items</span>
      </div>

      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
        {PHOTOS.map(({ id, src, alt }) => (
          <button
            key={id}
            className="group relative mb-3 block w-full overflow-hidden rounded-2xl focus:outline-none"
          >
            <img
              src={src}
              alt={alt}
              className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 rounded-2xl bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />
          </button>
        ))}
      </div>
    </section>
  );
}
