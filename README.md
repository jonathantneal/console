# console

**console** helps you debug old Internet Explorer by giving you a Chrome-inspired developer console.

![A console in old Internet Explorer](https://i.imgur.com/hGgoL8s.png)

To use it, just add the script to your page, preferably before another script may need it.

```html
<script src="//rawgit.com/jonathantneal/console/master/console.min.js"></script>
```

Or, create a bookmarklet that lets you add a console anywhere on the fly:

```js
javascript:(function(){document.body.appendChild(document.createElement('script')).src='//rawgit.com/jonathantneal/console/master/console.min.js'})();
```

On first load, the console will appear fixed to the bottom of the screen. It may be resized by dragging the gray handle at its top or hidden by clicking on the close button. On refresh, it will remember whether its open or closed, how tall it should be, and even what you’ve been typing into it.

## Using the Console API

### console.log()

Displays messages in the console.

Arrays, Booleans, Objects, Functions, Numbers, and Strings are all displayed with syntax highlighting. Object properties can be expanded by clicking the `+` icon.

```js
console.log("THX", 1138);
```

### console.clear()

Clears the console.

```js
console.clear();
```

### console.error()

Displays error messages in the console with an error badge.

```js
console.error("Well there's your problem.");
```

### console.info()

Displays information in the console with an information badge.

```js
console.info("So far it works.");
```

### console.table()

Displays an array of objects as a table.

```js
console.info([{
    title: 'Krull',
    genre: 'scifi'
}, {
    title: 'Labyrinth',
    genre: 'fantasy'
}, {
    title: 'Mystery Science Theater 3000',
    genre: 'comedy'
}]);
```

### console.warn()

Displays warnings in the console with a warning badge.

```js
console.warn("It's dangerous to go alone.");
```

The commands `console.debug` and `console.dir` are forwarded to `console.log`.

## Shortcuts

- `CTRL + SHIFT + I`: shows or hides the console
- `CTRL + K`: clears the console log
- `UP`: gets the last manual entry
- `DOWN`: gets the next manual entry

---

> This script is dedicated to the curious, the nostalgic, and the few of us who from time to time legitimately need a debugging tool for a browser we’ve all worked hard to forget. With apologies to Microsoft and the modern web.
> 
> Jonathan Neal

---

The script is 20KB uncompressed or 3.5K minified + gzipped.