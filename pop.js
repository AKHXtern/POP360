// Eheeey! Welcome to POP.js

const POP = function(params) {
    const that = this;
    that.configs = {
        controls   : true,
        editorMode : true
    };
    that.mode = 'desktop'; // or 'vr'
    that.three = {};
    that.container = (params && params.container) || document.body;
    that.elements = [];
    that.worlds = params.worlds || [];
    that.objects = [];
    that.selectedWorld = params.selectedWorld || 0;
    that.cursorCoords = {};
    that.isMobile = function() {
        var check = false;
        (function(a) {
            if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
        })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    };

    that.events = {
        resize            : function() {
            that.three.camera.aspect = window.innerWidth / window.innerHeight;
            that.three.camera.updateProjectionMatrix();

            that.three.rendererGL.setSize(window.innerWidth, window.innerHeight);
            that.three.rendererCSS.setSize(window.innerWidth, window.innerHeight);

            if(that.mode === 'vr') {
                that.effect && that.effect.setSize(window.innerWidth, window.innerHeight);
            }
        },
        addMovingClass    : function() {
            document.body.setAttribute('move', 'true');
        },
        removeMovingClass : function() {
            document.body.removeAttribute('move');
        }
    };

    that.utils = {
        hasFormat : function() {
            String.prototype.hasFormat = function(formats) {
                const value = this.toString();

                const filter = formats.filter(function(item) {
                    return value.indexOf(item) > -1;
                });

                return filter[0] && filter[0].replace('.', '') || false;
            }
        }
    };

    that.saveImage = function() {

        // This is experiment, fuck this shit

        const planes = [];

        const capture = function(index) {
            if(index + 1 !== that.elements.length) return;

            const position = {
                x : that.three.camera.position.x,
                y : that.three.camera.position.y,
                z : that.three.camera.position.z
            };

            that.three.camera.position.set(0, 0, 0);
            that.three.equi.update(that.three.camera, that.three.sceneGL, function() {

                that.three.camera.position.set(position.x, position.y, position.z)

                planes.forEach(function(item) {
                    that.three.sceneGL.remove(item);
                });
            });

        };

        that.elements.forEach(function(element, i) {
            const copy = element.element.cloneNode(true);
            const style = copy.getAttribute('style');

            const x = copy.getAttribute('x'),
                y = copy.getAttribute('y'),
                z = copy.getAttribute('z'),
                world = copy.getAttribute('world');

            const W = element.element.offsetWidth,
                H = element.element.offsetHeight;

            if(parseInt(world) !== that.selectedWorld()) return;

            copy.removeAttribute('style');
            document.body.appendChild(copy);

            html2canvas(copy, {
                allowTaint : true,
                logging    : true,
                width      : W,
                height     : H
            }).then(function(canvas) {
                const texture = new THREE.Texture(canvas);
                texture.needsUpdate = true;

                const geometry = new THREE.PlaneGeometry(W, H);
                const material = new THREE.MeshBasicMaterial({
                    map         : texture,
                    side        : THREE.DoubleSide,
                    transparent : true,
                    alphaTest   : 0.5
                });
                const plane = new THREE.Mesh(geometry, material);
                that.three.sceneGL.add(plane);

                plane.position.set(x, y, z);
                plane.lookAt(that.three.camera.position);

                console.log(plane);

                planes.push(plane);

                document.body.removeChild(copy);

                setTimeout(function() {
                    capture(i);
                }, 100);
            });
        });
    };

    that.init = function() {
        that.three.sceneGL = new THREE.Scene();
        that.three.sceneCSS = new THREE.Scene();

        // -- Setting up the camera -- //
        that.three.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100000);
        that.three.camera.position.z = 1;

        const light = new THREE.DirectionalLight(0xffffff, 4);
        light.position.set(0, 800, 0);

        light.castShadow = true;

        light.shadow.mapSize.width = 2024;
        light.shadow.mapSize.height = 2024;

        const d = 200;

        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;

        light.shadow.camera.far = 2000;

        that.three.sceneGL.add(light);
        that.three.dlight = light;

        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        that.three.sceneGL.add(ambient);
        that.three.alight = ambient;

        // -- Defining the WebGL and CSS3D Renderers -- //
        const rendererCSS = (that.mode === 'vr') ? new THREE.CSS3DStereoRenderer() : new THREE.CSS3DRenderer();
        rendererCSS.setSize(window.innerWidth, window.innerHeight);
        rendererCSS.domElement.id = 'renderer-css';

        const rendererGL = new THREE.WebGLRenderer({
            alpha                 : true,
            antialias             : true,
            preserveDrawingBuffer : true
        });
        rendererGL.setClearColor(0x00ff00, 0.0);
        rendererGL.domElement.id = 'renderer-gl';
        rendererGL.setPixelRatio( window.devicePixelRatio );

        if(that.mode === 'vr') {
            const effect = new THREE.StereoEffect(rendererGL);
            effect.setSize(window.innerWidth, window.innerHeight);

            that.effect = effect;
        }

        that.three.equi = new THREE.CubemapToEquirectangular(rendererGL, true);

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

        // -- Adding a method to the string class -- //
        that.utils.hasFormat();

        that.addPopElements();
        that.attachingTheEvents();
        that.animate();
    };
    that.createWorld = function(options, cb) {
        options.koColor = options.koColor || ko.observable('blue');
        options.color = options.koColor();
        options.depthTest = false;

        const world = new THREE.Mesh(
            new THREE.SphereGeometry(options.size, 100, 50),
            new THREE.MeshBasicMaterial(that.configs.editorMode ? {side : THREE.DoubleSide} : options)
        );

        var sphereFrame;
        world.options = options;
        world.material.side = THREE.DoubleSide;
        that.three.sceneGL.add(world);

        if(that.configs.editorMode) {
            const sphereFrameGeo = new THREE.EdgesGeometry(world.geometry);
            const sphereFrameMat = new THREE.LineBasicMaterial({
                color       : 'rgb(0,0,0)',
                linewidth   : 1,
                transparent : true,
                opacity     : 0.2
            });
            sphereFrame = new THREE.LineSegments(sphereFrameGeo, sphereFrameMat);

            const frameHolder = new THREE.Mesh(
                new THREE.SphereGeometry(options.size, 100, 50),
                new THREE.MeshBasicMaterial({side : THREE.DoubleSide, transparent : true, opacity : 0})
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
        return (sphereFrame || world);
    };
    that.selectWorld = function(index) {
        if(params.selectedWorld)
            params.selectedWorld(index);
        else
            that.selectedWorld = index;

        const helements = document.querySelectorAll('.pop-element:not([world="' + index + '"])'), // Elements I should hide
            selements = document.querySelectorAll('.pop-element[world="' + index + '"]'); // Elements I should show

        helements.forEach(function(element) {
            element.style.display = 'none';
        });

        selements.forEach(function(element) {
            element.style.display = 'block';
        });

        that.worlds().forEach(function(item, i) {
            if(i === index) {
                if(!item.world) item.world = {};

                item.visible = item.frameHolder.visible = item.world.visible = true;
            } else {
                if(!item.world) item.world = {};

                item.visible = item.frameHolder.visible = item.world.visible = false;
            }
        });
    };
    that.renderSpace = function(data){
        const that = this;

        data.worlds.forEach(function(world){
            const createdWorld = that.createWorld({
                size        : 1000,
                transparent : true,
                opacity     : 0.5
            });
            var texture;
            const loader = new THREE.TextureLoader();

            if(world.background) {
                if(world.background.videoSrc) {
                    const videoContainer = document.createElement('video');
                    videoContainer.width = 1024;
                    videoContainer.height = 768;
                    videoContainer.autoplay = true;
                    videoContainer.loop = true;
                    videoContainer.setAttribute('crossorigin', 'anonymous');
                    videoContainer.src = world.background.videoSrc;

                    texture = new THREE.VideoTexture(videoContainer);
                    texture.minFilter = THREE.LinearFilter;
                    texture.format = THREE.RGBFormat;

                    createdWorld.world.material = new THREE.MeshBasicMaterial({
                        map  : texture,
                        side : THREE.DoubleSide
                    });

                    createdWorld.world.background = world.background;
                    createdWorld.world.video = videoContainer;
                } else if(world.background.color) {
                    createdWorld.world.material.color = new THREE.Color(world.background.color);
                    createdWorld.world.background = world.background;
                } else if(world.background.gradient) {
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = 1024;
                    canvas.height = 768;
                    context.rect(0, 0, canvas.width, canvas.height);

                    const grd = context.createLinearGradient(canvas.width / 2, 0, canvas.width / 2, canvas.height);
                    grd.addColorStop(0, world.background.gradient[0]);
                    grd.addColorStop(1, world.background.gradient[1]);
                    context.fillStyle = grd;
                    context.fill();

                    texture = new THREE.Texture(canvas);
                    texture.needsUpdate = true;

                    createdWorld.world.material = new THREE.MeshBasicMaterial({
                        map  : texture,
                        side : THREE.DoubleSide
                    });
                    createdWorld.world.background = world.background;
                } else if(world.background.image) {
                    loader.load(
                        world.background.image,
                        function(texture) {
                            createdWorld.world.material = new THREE.MeshBasicMaterial({
                                map  : texture,
                                side : THREE.DoubleSide
                            });
                            createdWorld.world.background = world.background;
                        }
                    );
                }
            }
        });

        that.selectWorld(0);

        data.elements.forEach(function(element){
            pop.addEditorElement(element);
        });

        data.objects.forEach(function(object){
            pop.add3dObject(object);
        })
    };
    that.fileExists = function(url, cb) {
        var xmlhttp;
        // compatible with IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
        xmlhttp.onreadystatechange = function(oEvent) {
            if(xmlhttp.readyState === 4) {
                if(xmlhttp.status === 200) {
                    cb(xmlhttp);
                }
            }
        };
    };
    that.addPopElements = function(cb) {
        const popElements = document.querySelectorAll('.pop-element');
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

        const intersects = that.three.raycaster.intersectObjects(that.three.sceneGL.children);

        if(intersects.length > 0) {
            if(!intersects[0].face) intersects[0] = intersects[1];

            point = intersects[0].point;
            return point;
        }
    };
    that.changeMode = function(mode) {
        const that = this;

        if(mode) {
            that.mode = mode;
        } else {
            that.mode = (that.mode === 'vr') ? 'desktop' : 'vr';
        }

        if(that.mode === 'vr' && !that.effect) {
            const effect = new THREE.StereoEffect(that.three.rendererGL);
            effect.setSize(window.innerWidth, window.innerHeight);

            that.effect = effect;

            if(that.isMobile())
                that.three.controls = new THREE.DeviceOrientationControls(that.three.camera);
        } else {
            that.three.controls = new THREE.OrbitControls(that.three.camera, that.three.rendererGL.domElement);
        }

        that.rerender();
        that.events.resize();
    };
    that.rerender = function() {

        document.body.removeChild(document.querySelector('#renderer-css'));

        that.three.rendererCSS = (that.mode === 'vr') ? new THREE.CSS3DStereoRenderer() : new THREE.CSS3DRenderer();
        that.three.rendererCSS.setSize(window.innerWidth, window.innerHeight);
        that.three.rendererCSS.domElement.id = 'renderer-css';

        that.three.rendererCSS.domElement.appendChild(that.three.rendererGL.domElement);

        that.container.appendChild(that.three.rendererCSS.domElement);

        that.selectWorld(that.selectedWorld());

    };
    that.animate = function() {
        requestAnimationFrame(that.animate);

        that.objects.forEach(function(obj) {
            const worldNumber = obj.options.world;

            if (parseInt(worldNumber) !== that.selectedWorld()) obj.visible = false;
            else obj.visible = true;
        });

        that.three.rendererGL.render(that.three.sceneGL, that.three.camera);
        that.three.rendererCSS.render(that.three.sceneCSS, that.three.camera);

        if(that.mode === 'vr')
            that.effect && that.effect.render(that.three.sceneGL, that.three.camera);

        if(that.configs.controls)
            that.three.controls.update();
    };
    that.init();
};

POP.prototype.addHtml = function(params) {
    const that = this,
        htmlObject = new THREE.CSS3DObject(params.content);

    params.content.setAttribute('world', params.world);
    params.content.setAttribute('x', params.x);
    params.content.setAttribute('y', params.y);
    params.content.setAttribute('z', params.z);

    if(parseInt(params.world) !== that.selectedWorld()) {
        params.content.style.display = 'none';
    }

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


POP.prototype.addEditorElement = function(props){
    const that = this;

    const popElement = document.createElement('div');
    popElement.className = 'pop-element';
    popElement.innerHTML = props.content;

    popElement.addEventListener('mousedown', function() {
        that.events.addMovingClass();
        that.three.rendererGL.domElement.addEventListener('mousemove', moveElement);
    });

    that.three.rendererGL.domElement.addEventListener('mouseup', function() {
        that.events.removeMovingClass();
        that.three.rendererGL.domElement.removeEventListener('mousemove', moveElement);
    });

    popElement.setAttribute('x', props.x);
    popElement.setAttribute('y', props.y);
    popElement.setAttribute('z', props.z);
    popElement.setAttribute('world', props.world);

    function moveElement() {
        popElement.setAttribute('x', that.cursorCoords.x);
        popElement.setAttribute('y', that.cursorCoords.y);
        popElement.setAttribute('z', that.cursorCoords.z);

        popElement.object.position.set(that.cursorCoords.x, that.cursorCoords.y, that.cursorCoords.z);
        popElement.object.lookAt(that.three.camera.position);
    }

    that.addPopElement(popElement, {
        world : props.world,
        x     : props.x,
        y     : props.y,
        z     : props.z
    }, function() {
        // ko.applyBindings(editorModel, popElement);
    });

};

POP.prototype.add3dObject = function(){
    //TODO: Implement 3d object addition

    return [];
};
