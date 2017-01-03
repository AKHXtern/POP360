// Eheeey! Welcome to POP.js

var POP = function(params) {
    var that = this;
    that.configs = {
        controls   : true,
        editorMode : true
    };
    that.mode = 'desktop'; // or 'vr'
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

            if(that.mode == 'vr') {
                that.effect && that.effect.setSize( window.innerWidth, window.innerHeight );
            }
        },
        addMovingClass    : function() {
            document.body.setAttribute('move', 'true');
        },
        removeMovingClass : function() {
            document.body.removeAttribute('move');
        }
    };

    that.saveImage = function(){

        // This is experiment, fuck this shit

        that.elements.forEach(function(element){
            var copy = element.element;
            var style = copy.getAttribute('style');

            var x = copy.getAttribute('x'),
                y = copy.getAttribute('y'),
                z = copy.getAttribute('z'),
                world = copy.getAttribute('world');

            var W = copy.offsetWidth,
                H = copy.offsetHeight;

            if(world != that.selectedWorld()) return;

            copy.removeAttribute('style');
            html2canvas(copy, {
              allowTaint: true,
              logging: true,
              onrendered: function(canvas) {

                    var texture = new THREE.Texture(canvas);
                    texture.needsUpdate = true;

                    var geometry = new THREE.PlaneGeometry( W, H, 10, 10 );
                    var material = new THREE.MeshBasicMaterial( {map: texture, side: THREE.DoubleSide, transparent: true} );
                    var plane = new THREE.Mesh( geometry, material );
                    that.three.sceneGL.add( plane );

                    plane.position.set(x, y, z);
                    plane.lookAt(that.three.camera.position);

              },
              width: W,
              height: H
            });
            copy.setAttribute('style', style);

        })

        that.three.camera.position.z = 0;
        setTimeout(function(){
            that.three.equi.update( that.three.camera, that.three.sceneGL );

            that.three.camera.position.z = 300;
        }, 1000);
    };

    that.init = function() {
        that.three.sceneGL = new THREE.Scene();
        that.three.sceneCSS = new THREE.Scene();

        // -- Setting up the camera -- //
        that.three.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000000);
        that.three.camera.position.z = 300;

        // -- Defining the WebGL and CSS3D Renderers -- //
        var rendererCSS = null;

        rendererCSS = that.mode == 'vr' ? new THREE.CSS3DStereoRenderer() : new THREE.CSS3DRenderer();
        rendererCSS.setSize(window.innerWidth, window.innerHeight);
        rendererCSS.domElement.id = 'renderer-css';

        var rendererGL = new THREE.WebGLRenderer({
            alpha     : true,
            antialias : true,
            preserveDrawingBuffer: true
        });
        rendererGL.setClearColor(0x00ff00, 0.0);
        rendererGL.domElement.id = 'renderer-gl';

        if(that.mode == 'vr') {
            var effect = new THREE.StereoEffect( rendererGL );
            effect.setSize( window.innerWidth, window.innerHeight );

            that.effect = effect;
        }

        that.three.equi = new THREE.CubemapToEquirectangular( rendererGL, true );

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
            that.three.controls.enablePan = false;
        }

        that.addPopElements();
        that.attachingTheEvents();
        that.animate();
    };
    that.createWorld = function(options, cb) {
        options.koColor = options.koColor || ko.observable('blue');
        options.color = options.koColor();
        options.depthTest = false;

        var world = new THREE.Mesh(
            new THREE.SphereGeometry(options.size, 100, 50),
            new THREE.MeshBasicMaterial(that.configs.editorMode ? { side: THREE.DoubleSide } : options)
        );
        var sphereFrame;
        world.options = options;
        world.material.side = THREE.DoubleSide;
        that.three.sceneGL.add(world);

        if(that.configs.editorMode) {
            var sphereFrameGeo = new THREE.EdgesGeometry(world.geometry);
            var sphereFrameMat = new THREE.LineBasicMaterial({color : 'rgb(0,0,0)', linewidth : 1, transparent: true, opacity: 0.2});
            sphereFrame = new THREE.LineSegments(sphereFrameGeo, sphereFrameMat);

            var frameHolder = new THREE.Mesh(
                new THREE.SphereGeometry(options.size, 100, 50),
                new THREE.MeshBasicMaterial({side: THREE.DoubleSide, transparent: true, opacity: 0})
            );

            that.three.sceneGL.add(frameHolder);

            frameHolder.scale.set(0.5, 0.5, 0.5);
            sphereFrame.scale.set(0.6, 0.6, 0.6);

            sphereFrame.frameHolder = frameHolder;
            sphereFrame.visible = false;
            sphereFrame.world = world;
            sphereFrame.options = options;
        }
        that.three.sceneGL.add(sphereFrame);
        that.worlds.push(sphereFrame || world);

        that.selectWorld(that.worlds().length - 1);

        cb && cb();
    };
    that.selectWorld = function(index) {
        if(params.selectedWorld)
            params.selectedWorld(index);
        else
            that.selectedWorld = index;

        var helements = document.querySelectorAll('.pop-element:not([world="' + index + '"])'), // Elements I should hide
            selements = document.querySelectorAll('.pop-element[world="' + index + '"]'); // Elements I should show

            helements.forEach(function(element){
                element.style.display = 'none';
            });

            selements.forEach(function(element){
                element.style.display = 'block';
            });

        that.worlds().forEach(function(item, i) {
            if(i == index) {
                if(!item.world) item.world = {};

                item.visible = item.frameHolder.visible = item.world.visible = true;
            } else {
                if(!item.world) item.world = {};

                item.visible = item.frameHolder.visible = item.world.visible = false;
            }
        });
    };
    that.addPopElements = function(cb) {
        var popElements = document.querySelectorAll('.pop-element');
        for(var i = 0; i < popElements.length; i++) {
            if(that.elements.indexOf(popElements[i]) < 0) {
                that.addPopElement(popElements[i], {
                    world : popElements[i].getAttribute('world'),
                    x     : popElements[i].getAttribute('x'),
                    y     : popElements[i].getAttribute('y'),
                    z     : popElements[i].getAttribute('z')
                });
            }
        }
        cb && cb();
    };
    that.addPopElement = function(element, option, cb) {
        if(option.world === false) {
            console.error("The 'world' attribute is required for the element.")
            return;
        }

        that.addHtml({
            world   : option.world,
            x       : option.x || 0,
            y       : option.y || 0,
            z       : option.z || 0,
            content : element
        });
        cb && cb();
    };
    that.attachingTheEvents = function() {
        window.addEventListener('resize', that.events.resize);
        that.three.rendererGL.domElement.addEventListener('mousedown', that.events.addMovingClass);
        that.three.rendererGL.domElement.addEventListener('mousemove', function(e) {
            that.cursorCoords = that.getCoordsFromWorld(e, 1);
        });
        that.three.rendererGL.domElement.addEventListener('dragover', function(e) {
            that.cursorCoords = that.getCoordsFromWorld(e, 1);
        });
        that.three.rendererGL.domElement.addEventListener('mouseup', that.events.removeMovingClass);
    };
    that.getCoordsFromWorld = function(event, index) {
        event.preventDefault();
        var point;

        that.three.mouse.x = ( event.clientX / that.three.rendererGL.domElement.clientWidth ) * 2 - 1;
        that.three.mouse.y = -( event.clientY / that.three.rendererGL.domElement.clientHeight ) * 2 + 1;

        that.three.raycaster.setFromCamera(that.three.mouse, that.three.camera);

        var intersects = that.three.raycaster.intersectObjects(that.three.sceneGL.children);

        if(intersects.length > 0) {
            if(!intersects[0].face) intersects[0] = intersects[1];

            point = intersects[0].point;
            return point;
        }
    };
    that.changeMode = function(mode) {
        var that = this;

        if(mode){
            that.mode = mode;
        } else {
            that.mode = that.mode == 'vr' ? 'desktop' : 'vr';
        }

        if(that.mode == 'vr' && !that.effect) {
            var effect = new THREE.StereoEffect( that.three.rendererGL );
            effect.setSize( window.innerWidth, window.innerHeight );

            that.effect = effect;
        }

        that.rerender();
        that.events.resize();
    };
    that.rerender = function(){

        document.body.removeChild(document.querySelector('#renderer-css'));

        that.three.rendererCSS = that.mode == 'vr' ? new THREE.CSS3DStereoRenderer() : new THREE.CSS3DRenderer();
        that.three.rendererCSS.setSize(window.innerWidth, window.innerHeight);
        that.three.rendererCSS.domElement.id = 'renderer-css';

        that.three.rendererCSS.domElement.appendChild(that.three.rendererGL.domElement);

        that.container.appendChild(that.three.rendererCSS.domElement);

        that.selectWorld(that.selectedWorld());

    };
    that.animate = function() {
        requestAnimationFrame(that.animate);

        that.three.rendererGL.render(that.three.sceneGL, that.three.camera);
        that.three.rendererCSS.render(that.three.sceneCSS, that.three.camera);

        if(that.mode == 'vr')
            that.effect && that.effect.render(that.three.sceneGL, that.three.camera);

        if(that.configs.controls)
            that.three.controls.update();
    };
    that.init();
};

POP.prototype.addHtml = function(params) {
    var that = this,
        htmlObject = new THREE.CSS3DObject(params.content);

    params.content.setAttribute('world', params.world);
    params.content.setAttribute('x', params.x);
    params.content.setAttribute('y', params.y);
    params.content.setAttribute('z', params.z);

    htmlObject.position.z = params.z || 0;
    htmlObject.position.y = params.y || 0;
    htmlObject.position.x = params.x || 0;

    htmlObject.element = params.content;
    htmlObject.index = that.elements.length;
    params.content.object = htmlObject;

    htmlObject.lookAt(that.three.camera.position);

    // -- Adding the HTML Content to scene -- //
    that.three.sceneCSS.add(htmlObject);
    that.elements.push(htmlObject);
};
POP.prototype.add3dObject = function(params) {
    // :TODO -- This function supports .obj, .js, .collada model formats -- //
    var that = this;
};
