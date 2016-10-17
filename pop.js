// Eheeey! Welcome to POP.js

var POP = function(params) {
    var that = this;
    that.configs = {
        controls : true,
        editor   : true
    };
    that.three = {};
    that.container = (params && params.container) || document.body;
    that.elements = [];

    that.events = {
        resize            : function() {
            that.three.camera.aspect = window.innerWidth / window.innerHeight;
            that.three.camera.updateProjectionMatrix();

            that.three.rendererGL.setSize(window.innerWidth, window.innerHeight);
            that.three.rendererCSS.setSize(window.innerWidth, window.innerHeight);
        },
        addMovingClass    : function() {
            document.body.className = 'pop-moving';
        },
        removeMovingClass : function() {
            document.body.className = '';
        }
    };

    that.init = function() {
        that.three.sceneGL = new THREE.Scene();
        that.three.sceneCSS = new THREE.Scene();

        // -- Setting up the camera -- //
        that.three.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000000);
        that.three.camera.position.z = 1;

        // -- Defining the WebGL and CSS3D Renderers -- //
        var rendererCSS = new THREE.CSS3DRenderer();
        rendererCSS.setSize(window.innerWidth, window.innerHeight);
        rendererCSS.domElement.id = 'rendererCSS';

        var rendererGL = new THREE.WebGLRenderer({
            alpha     : true,
            antialias : true
        });
        rendererGL.setClearColor(0x00ff00, 0.0);
        rendererGL.domElement.id = 'rendererGL';

        rendererGL.setSize(window.innerWidth, window.innerHeight);
        rendererCSS.domElement.appendChild(rendererGL.domElement);

        that.container.appendChild(rendererCSS.domElement);

        that.three.rendererGL = rendererGL;
        that.three.rendererCSS = rendererCSS;

        // -- Adding the orbit controls -- //
        if(that.configs.controls) {
            that.three.controls = new THREE.OrbitControls(that.three.camera, that.three.rendererGL.domElement);
            that.three.controls.zoomSpeed = 0;
        }

        if(that.configs.editor) {
            that.initEditor();
        }

        that.addPopElements();
        that.attachingTheEvents();
        that.animate();
    };
    that.initEditor = function() {

        // -- Showing the sphere with the frame -- //
        var sphereFrameMesh = new THREE.Mesh(
            new THREE.SphereGeometry(800, 50, 25),
            new THREE.MeshBasicMaterial()
        );
        var sphereFrame = new THREE.EdgesHelper(sphereFrameMesh, 0x0000ff);
        sphereFrame.material.linewidth = 2;
        that.three.sceneGL.add(sphereFrame);

    };
    that.addPopElements = function() {
        var popElements = document.querySelectorAll('.pop-element');

        for(var i = 0; i < popElements.length; i++) {
            if(that.elements.indexOf(popElements[i]) < 0) {
                that.elements.push(popElements[i]);
                that.addHtml({
                    x       : popElements[i].getAttribute('x') || '0',
                    y       : popElements[i].getAttribute('y') || '0',
                    z       : popElements[i].getAttribute('z') || '0',
                    content : popElements[i]
                });
            }
        }
    };
    that.attachingTheEvents = function() {
        window.addEventListener('resize', that.events.resize);
        that.three.rendererGL.domElement.addEventListener('mousedown', that.events.addMovingClass);
        that.three.rendererGL.domElement.addEventListener('mouseup', that.events.removeMovingClass);
    };
    that.animate = function() {
        requestAnimationFrame(that.animate);

        that.three.rendererGL.render(that.three.sceneGL, that.three.camera);
        that.three.rendererCSS.render(that.three.sceneCSS, that.three.camera);

        if(that.configs.controls)
            that.three.controls.update();
    };
    that.init();
};

POP.prototype.addHtml = function(params) {
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
