/**
 * Copyright (c) 2017 Alex Forbes and Denzil Buchner
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

class BaseGame {
    constructor(tagName, fps = 0, clearColor = "#33aadd", camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000)) {


        // Assert that required methods have been overridden
        if (this.init === undefined) { throw new TypeError("Must override method: init()") }
        if (this.deInit === undefined) { throw new TypeError("Must override method: deInit()") }
        if (this.update === undefined) { throw new TypeError("Must override method: update(delta)") }
        if (this.onWindowResize === undefined) { throw new TypeError("Must override method: onWindowResize()") }
        
        
        this._clear()

        this.tagName = tagName

        // Create an empty scene
        this.scene = new THREE.Scene();

        this.camera = camera

        this.prevSecond = 0
        this.framesThisSecond = 0

        this.forceFPS = fps // 0 // 60 
        this.clearColor = clearColor

        if (this.forceFPS) {
            this.updateFunction = setInterval(() => this.nextFrameRequest = requestAnimationFrame(this.bound_update), 1000 / this.forceFPS)
        }
        this.paused = false


        this.raycaster = new THREE.Raycaster();
        this.mouseNormalised = {x: 0, y: 0 }

    }

    // private init
    _init() {

        this.parentDiv = document.getElementById(this.tagName)

        // Shows framerate stats
        this.stats = new Stats();
        this.parentDiv.appendChild(this.stats.dom)

        this.clock = new THREE.Clock()

        // Create a renderer with Antialiasing
        this.renderer = new THREE.WebGLRenderer({ antialias: true });

        // Configure renderer clear color
        this.renderer.setClearColor(this.clearColor);

        // this.resolutionScale = 0.33
        this.resolutionScale = 1.0

        this.renderer.setPixelRatio(window.devicePixelRatio * this.resolutionScale)
        
        // Configure renderer size
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.renderer.autoClear = false; // To allow render overlay on top of sprited sphere

        this.renderer.gammaOutput = false

        // Add ThreeJS DOM element to existing element
        this.thisCanvas = this.parentDiv.appendChild(this.renderer.domElement)

        // Setup resize callback
        this.bound_onWindowResize = this._onWindowResize.bind(this)
        window.addEventListener('resize', this.bound_onWindowResize, false);

        // Setup keyboard callbacks

        this.bound_handleKeyDown = (event) => this.handleKeyDown(event)
        this.bound_handleKeyUp = (event) => this.handleKeyUp(event)


        this.bound_handleMouseUp = (event) => this.handleMouseUp(event)
        this.bound_handleMouseDown = (event) => this.handleMouseDown(event)
        this.bound_handleMouseMove = (event) => this.handleMouseMove(event)
        this.bound_handleMouseWheel = (event) => this.handleMouseWheel(event)

        window.addEventListener('keydown', this.bound_handleKeyDown, false);
        window.addEventListener('keyup', this.bound_handleKeyUp, false);

        window.addEventListener('mousedown', this.bound_handleMouseDown, false);
        window.addEventListener('mouseup', this.bound_handleMouseUp, false);
        window.addEventListener('mousemove', this.bound_handleMouseMove, false);
        window.addEventListener('mousewheel', this.bound_handleMouseWheel, false);

        // // Initialise and staru

        this.bound_update = () => this._update()

        this.init()
    }
    // private clear
    _clear() {

        this.tagName = ""
        this.isKeyDown = {}
        this.wasKeyDown = {}
        
        this.mouse = {x: 0, y: 0, xVel: 0, yVel: 0, xPrev: 0, yPrev: 0, wheel: 0, buttonDown: []}

        if (this.clock) {
            this.clock.stop()
        }
        this.clock = undefined

        if (this.renderer) { // This is required if we want to destroy the WebGL context associated with the renderer
            this.renderer.forceContextLoss();
        }
        this.renderer = undefined

        // for old method of scheduling renders
        if (this.updateFunction){
            clearInterval(this.updateFunction)
        }
        this.updateFunction = undefined

        this.camera = undefined
        this.scene = undefined
    }


    handleKeyDown(event) {

        // console.log(event.keyCode)

        this.wasKeyDown[event.keyCode] = this.isKeyDown[event.keyCode]
        
        this.isKeyDown[event.keyCode] = true

        // console.log(this.isKeyDown)
        // TODO: Prevent Esc from messing up the scale when exiting fullscreen
        if (event.keyCode == 27) { //Esc
            // event.preventDefault()
            // this.stop()
        }

    }

    handleKeyUp(event) {


        this.wasKeyDown[event.keyCode] = this.isKeyDown[event.keyCode]

        this.isKeyDown[event.keyCode] = false
    }

    handleMouseUp(event) {
        this.mouse.buttonDown[event.button] = false
        if (this.onMouseUp) {
            this.onMouseUp(event)
        }
    }

    handleMouseDown(event) {
        // if (event.target == this){
        //     console.log('HERE')
        // }
        this.mouse.buttonDown[event.button] = true
        if (this.onMouseDown) {
            this.onMouseDown(event)
        }
    }
    handleMouseMove(event) {

        this.mouse.x = event.x
        this.mouse.y = event.y
        // Buffer mouse velocity until next update.


        this.mouse.xVel += event.movementX
        this.mouse.yVel += event.movementY

        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        this.mouseNormalised.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouseNormalised.y = - (event.clientY / window.innerHeight) * 2 + 1;
        // console.log(this.mouseNormalised)

        if (this.onMouseMove) {
            this.onMouseMove(event)
        }
    }
    handleMouseWheel(event) {
        // Buffer mouse wheel delta until next update.
        this.mouse.wheel += event.wheelDelta

        if (this.onMouseWheel) {
            this.onMouseWheel(event)
        }

    }


    _onWindowResize() {

        this.onWindowResize()

        let {camera, renderer} = this

        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    keyDown(key) {
        let keyCode = key.charCodeAt(0) - 32
        // console.log(keyCode)
        return this.isKeyDown[keyCode]
    }

    keyPressed(key){
        let keyCode = key.charCodeAt(0) - 32
        // console.log(keyCode)
        return this.isKeyDown[keyCode] && !this.wasKeyDown[keyCode]

    }

    keyReleased(key){

        let keyCode = key.charCodeAt(0) - 32
        // console.log(keyCode)
        return !this.isKeyDown[keyCode] && this.wasKeyDown[keyCode]

    }

    pauseToggle(){
        this.paused = !this.paused
    }

    raySelect(){
        
        // update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera( this.mouseNormalised, this.camera );

        // calculate objects intersecting the picking ray
        let intersects = this.raycaster.intersectObjects( this.scene.children );

        return intersects

    }

    // While update is called before rendering, this is called afterwards.
    postRender(delta){

    }

    _update() {

        if (!this.forceFPS) {
            this.nextFrameRequest = requestAnimationFrame(this.bound_update);
        }

        
        let delta = this.clock.getDelta()
        if (this.paused){
            delta = 0
        }

        // console.log(this.paused)
        

        let currentSecond = Math.round(this.clock.getElapsedTime())
        this.framesThisSecond++
        // console.log(time)
        if (currentSecond !== this.prevSecond) {
            this.prevSecond = currentSecond
            // console.log(`Second: ${currentSecond} FPS: ${this.framesThisSecond}`)
            this.framesThisSecond = 0
        }

        // this.handleInput(delta)        

        

        this.renderer.clear();

        this.update(delta)      

        this.renderer.render(this.scene, this.camera)
        // this.renderer.clearDepth();

        this.postRender(delta)

        this.stats.update()

        this.mouse.xVel = 0
        this.mouse.yVel = 0
        this.mouse.wheel = 0

        for (let key in this.isKeyDown){
            this.wasKeyDown[key] = this.isKeyDown[key]
        }
    }


    start() {
        this._init();
        this._update();
    }


    stop() {

        this.deInit()

        window.removeEventListener('resize', this.bound_onWindowResize)
        window.removeEventListener('keyup', this.bound_handleKeyUp)
        window.removeEventListener('keydown', this.bound_handleKeyDown)

        window.removeEventListener('mouseup', this.bound_handleMouseUp)
        window.removeEventListener('mousedown', this.bound_handleMouseDown)
        window.removeEventListener('mousemove', this.bound_handleMouseMove)
        window.removeEventListener('mousewheel', this.bound_handleMouseWheel)

        this.bound_onWindowResize = undefined
        this.bound_handleKeyUp = undefined
        this.bound_handleKeyDown = undefined
        this.bound_update = undefined

        // Cancel existing request for next frame
        cancelAnimationFrame(this.nextFrameRequest)

        // Remove canvas from the parent div to which it was added
        empty(this.parentDiv)

        // Do this last since it clears all local variables
        this._clear()

        function empty(elem) {
            while (elem.lastChild) elem.removeChild(elem.lastChild);
        }
    }

    gui(){
        return ''
    }
}

module.exports = BaseGame