let noise = require('./../libs/improved_noise')
let perlin = new noise.ImprovedNoise()

let randSeed = Math.random(), randX = Math.random(), randZ = Math.random()
let { TileType } = require('./../survival2d/tile')
let Mathf = require('./../core/utils/math')
let OCEAN_DEPTH = 10
let WORLD_WIDTH = 100
let WORLD_HEIGHT = 100

function lerp (a,  b,  c) {
    c = c < 0 ? 0 : c
    c = c > 1 ? 1 : c
    return a + c * (b - a);
}

function getHeight(x, y, f) {

    let h = 0
    let q = 1

    for (var j = 0; j < 1; j++) {

        h += (perlin.noise(randX + f * x / q, randZ + f * y / q, randSeed) + 0.4) * q;
        q *= 4;
    }

    h *= Mathf.lerp (0, 1, x / OCEAN_DEPTH);
    h *= Mathf.lerp (0, 1, y / OCEAN_DEPTH);
    h *= Mathf.lerp (0, 1, (WORLD_WIDTH - x) / OCEAN_DEPTH);
    h *= Mathf.lerp (0, 1, (WORLD_HEIGHT - y) / OCEAN_DEPTH);

    return h;
}

function generateTileMap(world) {
    for (var x = 0; x < world.WORLD_WIDTH; x++) {
        for (var y = 0; y < world.WORLD_HEIGHT; y++) {
            let h = getHeight(x, y, 0.1)

            let tile = 0
            if (h < 0.3) {
                tile = TileType.WATER 
            }
            else if (h < 0.5) {
                tile = TileType.SAND
            }
            else if (h < 0.8) {
                tile = TileType.GRASS
            }
            else {
                tile = TileType.ROCK
            }
            world.setTile(x,y,tile)
        }    
    }
}

module.exports = {
    getHeight,
    generateTileMap
}