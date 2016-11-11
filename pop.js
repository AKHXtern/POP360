// Eheeey! Welcome to POP.js

var POP = function(params) {
    var that = this;
    that.configs = {
        controls   : true,
        editorMode : true
    };
    that.three = {};
    that.container = (params && params.container) || document.body;
    that.elements = [];
    that.worlds = params.worlds || [];
    that.selectedWorld = params.selectedWorld || 0;
    that.cursorCoords = {};

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

        that.three.raycaster = new THREE.Raycaster();
        that.three.mouse = new THREE.Vector2();

        // -- Adding the orbit controls -- //
        if(that.configs.controls) {
            that.three.controls = new THREE.OrbitControls(that.three.camera, that.three.rendererGL.domElement);
            that.three.controls.zoomSpeed = 0;
        }

        that.addPopElements();
        that.attachingTheEvents();
        that.animate();
    };
    that.createWorld = function(options, cb) {
        options.color = options.color || 'blue';
        options.depthTest = false;

        var world = new THREE.Mesh(
            new THREE.SphereGeometry(options.size, 100, 50),
            new THREE.MeshBasicMaterial()
        );
        var sphereFrame;
        world.options = options;
        world.material.side = THREE.DoubleSide;
        that.three.sceneGL.add(world);

        if(that.configs.editorMode) {
            var sphereFrameGeo = new THREE.EdgesGeometry( world.geometry );
            var sphereFrameMat = new THREE.LineBasicMaterial( { color: options.color, linewidth: 2 } );
            sphereFrame = new THREE.LineSegments( sphereFrameGeo, sphereFrameMat );

            sphereFrame.visible = false;
            sphereFrame.options = options;
        }
        that.three.sceneGL.add(sphereFrame || world);
        that.worlds.push(sphereFrame || world);

        that.selectWorld(that.worlds().length - 1);

        cb && cb();
    };
    that.selectWorld = function(index) {
        if(params.selectedWorld)
            params.selectedWorld(index);
        else
            that.selectedWorld = index;

        that.worlds().forEach(function(item, i) {
            if(i == index) {
                item.traverse(function(object) {
                    object.visible = true;
                });
            } else {
                item.traverse(function(object) {
                    object.visible = false;
                });
            }
        });
    };
    that.addPopElements = function(cb) {
        var popElements = document.querySelectorAll('.pop-element');

        for(var i = 0; i < popElements.length; i++) {
            if(that.elements.indexOf(popElements[i]) < 0) {
                that.elements.push(popElements[i]);
                that.addHtml({
                    world   : popElements[i].getAttribute('world'),
                    x       : popElements[i].getAttribute('x') || '0',
                    y       : popElements[i].getAttribute('y') || '0',
                    z       : popElements[i].getAttribute('z') || '0',
                    content : popElements[i]
                });
            }
        }
        cb && cb();
    };
    that.addPopElement = function(element, cb){
        that.elements.push(element);
        that.addHtml({
            world   : element.getAttribute('world'),
            x       : element.getAttribute('x') || '0',
            y       : element.getAttribute('y') || '0',
            z       : element.getAttribute('z') || '0',
            content : element
        });
    };
    that.attachingTheEvents = function() {
        window.addEventListener('resize', that.events.resize);
        that.three.rendererGL.domElement.addEventListener('mousedown', that.events.addMovingClass);
        that.three.rendererGL.domElement.addEventListener('mousemove', function(e){
            that.cursorCoords = that.getCoordsFromWorld(e);
        });
        that.three.rendererGL.domElement.addEventListener('mouseup', that.events.removeMovingClass);
    };
    that.getCoordsFromWorld = function(event) {
        event.preventDefault();
        var point;

        that.three.mouse.x = ( event.clientX / that.three.rendererGL.domElement.clientWidth ) * 2 - 1;
        that.three.mouse.y = - ( event.clientY / that.three.rendererGL.domElement.clientHeight ) * 2 + 1;

        that.three.raycaster.setFromCamera( that.three.mouse, that.three.camera );

        var intersects = that.three.raycaster.intersectObjects( that.three.sceneGL.children );

        if ( intersects.length > 0 ) {
            //if(!intersects[0].face) intersects[0] = intersects[1];
            point = intersects[0].point;
            return point;
        }
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
