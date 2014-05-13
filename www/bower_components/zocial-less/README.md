# Zocial social buttons - LESS version

This is the [LESS](http://lesscss.org/) version of the very nice Zocial social buttons, made by [@samcollins](https://github.com/samcollins/).
If you want new buttons, you may ask Sam on the [Zocial official repository](https://github.com/samcollins/css-social-buttons).

Zocial uses @font-face icons, which means:
* custom font file for all social icons
* icon font use private unicode spaces for accessibility _(No longer the reality for all icons)_
* em sizing based on button font-size
* support for 101 different services
* buttons and icons supported
* no raster images (sweet)
* works splendidly on any browser supporting @font-face
* CSS3 degrades gracefully in IE8 and below etc.
* also includes generic icon-less primary and secondary buttons

## Preview
Want to see the buttons in live action? Access the following link then:
[http://gustavohenke.github.com/zocial-less/](http://gustavohenke.github.com/zocial-less/)

## How to use these buttons

	<button class='zocial facebook'>Button label here</button>

or

	<a class="zocial twitter">Button label</a>

- Can be any element e.g. `a`, `div`, `button` etc.
- Add class of `.zocial`
- Add class for name of service e.g. `.dropbox`, `.twitter`, `.github`
- Done :-)

Under [MIT License](http://opensource.org/licenses/mit-license.php)
