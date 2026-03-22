# Cinematic Hero Section

## HTML

``` html
<section class="hero">

<video autoplay muted loop playsinline class="hero-video">
<source src="hero.mp4" type="video/mp4">
</video>

<div class="hero-overlay"></div>

<div class="hero-content">
<h1>Discover Hidden Greece</h1>
<p>Nature. Myth. Silence.</p>
</div>

</section>
```

## CSS

``` css
.hero{
position:relative;
height:100vh;
overflow:hidden;
}

.hero-video{
position:absolute;
width:100%;
height:100%;
object-fit:cover;
}

.hero-overlay{
position:absolute;
width:100%;
height:100%;
background:
linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6)),
url("grain.png");
mix-blend-mode:overlay;
opacity:0.6;
}

.hero-content{
position:relative;
z-index:2;
color:white;
text-align:center;
top:40%;
}
```
