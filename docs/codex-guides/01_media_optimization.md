# Media Optimization (Fast Cinematic Websites)

## Video Guidelines

-   Resolution: 1920x1080
-   Codec: H.264
-   Bitrate: 8--12 Mbps
-   Frame rate: 24fps
-   Duration: under 20 seconds
-   Target size: under 10MB

## Export Workflow

1.  Export video from editor (e.g. LumaFusion) in 1080p.
2.  Compress with HandBrake or FFmpeg.
3.  Remove audio if unnecessary.
4.  Host video locally or via CDN.

## Lazy Loading Example

``` html
<img src="preview.webp" loading="lazy" alt="">

<video autoplay muted loop playsinline preload="none">
  <source src="hero.mp4" type="video/mp4">
</video>
```

## Image Optimization

Use WebP or AVIF formats.

Recommended tools: - Squoosh - ImageOptim

Target sizes: - Hero images: 300--500KB - Section images: 150--300KB -
Thumbnails: under 100KB
