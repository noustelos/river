# Dropdown Navigation (Glass Style)

## HTML

``` html
<nav class="menu">
  <ul>
    <li class="dropdown">
      <a href="#">Explore</a>

      <div class="dropdown-content">
        <a href="#">Trails</a>
        <a href="#">Nature</a>
        <a href="#">Activities</a>
      </div>
    </li>
  </ul>
</nav>
```

## CSS

``` css
nav{
backdrop-filter:blur(10px);
background:rgba(0,0,0,0.4);
}

.dropdown-content{
opacity:0;
transform:translateY(10px);
transition:.3s;
}

.dropdown:hover .dropdown-content{
opacity:1;
transform:translateY(0);
}
```
