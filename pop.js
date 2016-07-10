// Eheeey! Welcome to POP.js

var POP = function(params){
    var that = this;
    that.configs = {};
    that.three = {};
    that.container = (params && params.container) || document.body;

    that.init = function(){
        that.three.sceneGL = new THREE.Scene();
        that.three.sceneCSS = new THREE.Scene();

        // -- Setting up the camera -- //
        that.three.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000000 );
        that.three.camera.position.z = 0;

        // -- Defining the WebGL and CSS3D Renderers -- //
        var rendererCSS = new THREE.CSS3DRenderer();
        rendererCSS.setSize(window.innerWidth, window.innerHeight);
        rendererCSS.domElement.id = 'rendererCSS';

        var rendererGL = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        rendererGL.setClearColor(0x00ff00, 0.0);
        rendererGL.domElement.id = 'rendererGL';

        rendererGL.setSize(window.innerWidth, window.innerHeight);
        rendererCSS.domElement.appendChild(rendererGL.domElement);

        that.container.appendChild(rendererCSS.domElement);

        that.three.rendererGL = rendererGL;
        that.three.rendererCSS = rendererCSS;

        that.addPopElements();
        that.animate();
    };
    that.addPopElements = function(){
        var that = this,
            popElements = document.querySelectorAll('.pop-element');

        for( var i=0; i < popElements.length; i++ ){
            that.addHtml({
                x: popElements[i].getAttribute('x') || '0',
                y: popElements[i].getAttribute('y') || '0',
                z: popElements[i].getAttribute('z') || '0',
                content: popElements[i]
            });
        }
    };
    that.animate = function(){
        requestAnimationFrame(that.animate);

        that.three.rendererGL.render(that.three.sceneGL, that.three.camera);
        that.three.rendererCSS.render(that.three.sceneCSS, that.three.camera);
    };
    that.init();
};

POP.prototype.addHtml = function(params){
    var that = this,
        htmlObject = new THREE.CSS3DObject(params.content);

	htmlObject.position.z = params.z || 0;
	htmlObject.position.y = params.y || 0;
	htmlObject.position.x = params.x || 0;

	// -- Adding the HTML Content to scene -- //
	that.three.sceneCSS.add(htmlObject);
};
POP.prototype.add3dObject = function(params) {
    // -- This function supports .obj, .js, .collada model formats -- //
    var that = this;
};
