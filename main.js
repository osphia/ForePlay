import { defs, tiny } from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

export class Main extends Scene {
    constructor() {
        super();

        this.shapes = {
            ball: new defs.Subdivision_Sphere(4),
            plane: new defs.Square(),
            obstacle: new defs.Cube(),
            hole: new defs.Subdivision_Sphere(4),
            arrow: new defs.Cube(),
            arrowhead: new defs.Cone_Tip(3, 10),
            fullscreen_quad: new defs.Square(),
            coin: new defs.Capped_Cylinder(1, 15, [[0, 2], [0, 2]]) // Use the new shape here
        };

        this.levels = [
            {
                obstacles: [
                    { minX: -16, maxX: -14, minY: -25, maxY: 25, minZ: -1, maxZ: 3, normal: vec3(1, 0, 0) },
                    { minX: -15, maxX: 15, minY: -26, maxY: -24, minZ: -1, maxZ: 3, normal: vec3(0, 1, 0) },
                    { minX: 14, maxX: 16, minY: -25, maxY: 25, minZ: -1, maxZ: 3, normal: vec3(-1, 0, 0) },
                    { minX: -16, maxX: -4, minY: 24, maxY: 26, minZ: -1, maxZ: 3, normal: vec3(0, -1, 0) },
                    { minX: 4, maxX: 16, minY: 24, maxY: 26, minZ: -1, maxZ: 3, normal: vec3(0, -1, 0) },
                    { minX: -6, maxX: -4, minY: -15, maxY: 25, minZ: -1, maxZ: 3, normal: vec3(1, 0, 0) },
                    { minX: 4, maxX: 6, minY: -15, maxY: 25, minZ: -1, maxZ: 3, normal: vec3(-1, 0, 0) },
                    { minX: -6, maxX: 6, minY: -15, maxY: -13, minZ: -1, maxZ: 3, normal: vec3(0, 1, 0) }
                ],
                obstacle_positions: [
                    { translation: [-15, 0, 1], scale: [1, 25, 2], rotation: [0, 0, 0] },
                    { translation: [0, -25, 1], scale: [16, 1, 2], rotation: [0, 0, 0] },
                    { translation: [15, 0, 1], scale: [1, 25, 2], rotation: [0, 0, 0] },
                    { translation: [-10, 25, 1], scale: [6, 1, 2], rotation: [0, 0, 0] },
                    { translation: [10, 25, 1], scale: [6, 1, 2], rotation: [0, 0, 0] },
                    { translation: [-5, 5, 1], scale: [1, 20, 2], rotation: [0, 0, 0] },
                    { translation: [5, 5, 1], scale: [1, 20, 2], rotation: [0, 0, 0] },
                    { translation: [0, -14, 1], scale: [5, 1, 2], rotation: [0, 0, 0] }
                ],
                hole_position: vec3(10, 20, 0),
                ball_start_position: vec3(-10, 20, 1)
            },
            {
                obstacles: [
                    { minX: -34, maxX: -32, minY: 0, maxY: 30, minZ: -1, maxZ: 3, normal: vec3(1, 0, 0) },
                    { minX: -34, maxX: -2, minY: -1, maxY: 1, minZ: -1, maxZ: 3, normal: vec3(0, 1, 0) },
                    { minX: 27, maxX: 29, minY: -21, maxY: 13, minZ: -1, maxZ: 3, normal: vec3(-1, 0, 0) },
                    { minX: -34, maxX: -2, minY: 29, maxY: 31, minZ: -1, maxZ: 3, normal: vec3(0, -1, 0) },
                    { minX: -3, maxX: 27, minY: -21, maxY: -19, minZ: -1, maxZ: 3, normal: vec3(0, -1, 0) },
                    { minX: -4, maxX: -2, minY: 11, maxY: 29, minZ: -1, maxZ: 3, normal: vec3(1, 0, 0) },
                    { minX: -4, maxX: -2, minY: -21, maxY: 1, minZ: -1, maxZ: 3, normal: vec3(1, 0, 0) },
                    { minX: -3, maxX: 27, minY: 11, maxY: 13, minZ: -1, maxZ: 3, normal: vec3(0, 1, 0) },
                    { minX: 6, maxX: 8, minY: -8, maxY: 12, minZ: -1, maxZ: 3, normal: vec3(1, 0, 0) },
                    { minX: 16, maxX: 18, minY: -20, maxY: 0, minZ: -1, maxZ: 3, normal: vec3(-1, 0, 0) },
                    { minX: -22, maxX: -14, minY: 11, maxY: 19, minZ: -1, maxZ: 3, normal: vec3(1, 0, 0) }
                ],
                obstacle_positions: [
                    { translation: [-33, 15, 1], scale: [1, 15, 2], rotation: [0, 0, 0] },
                    { translation: [-18, 0, 1], scale: [16, 1, 2], rotation: [0, 0, 0] },
                    { translation: [28, -4, 1], scale: [1, 17, 2], rotation: [0, 0, 0] },
                    { translation: [-18, 30, 1], scale: [16, 1, 2], rotation: [0, 0, 0] },
                    { translation: [12, -20, 1], scale: [15, 1, 2], rotation: [0, 0, 0] },
                    { translation: [-3, 20, 1], scale: [1, 9, 2], rotation: [0, 0, 0] },
                    { translation: [-3, -10, 1], scale: [1, 11, 2], rotation: [0, 0, 0] },
                    { translation: [12, 12, 1], scale: [15, 1, 2], rotation: [0, 0, 0] },
                    { translation: [7, 2, 1], scale: [1, 10, 2], rotation: [0, 0, 0] },
                    { translation: [17, -10, 1], scale: [1, 10, 2], rotation: [0, 0, 0] },
                    { translation: [-18, 15, 1], scale: [4, 4, 2], rotation: [0, 0, 0] }
                ],
                hole_position: vec3(-28, 25, 0),
                ball_start_position: vec3(23, -15, 1)
            },
            {
                obstacles: [
                    { minX: -36, maxX: -34, minY: -20, maxY: 40, minZ: -1, maxZ: 3, normal: vec3(1, 0, 0) },
                    { minX: 22, maxX: 24, minY: -20, maxY: 40, minZ: -1, maxZ: 3, normal: vec3(-1, 0, 0) },
                    { minX: -36, maxX: 24, minY: 39, maxY: 41, minZ: -1, maxZ: 3, normal: vec3(0, -1, 0) },
                    { minX: -36, maxX: 24, minY: -21, maxY: -19, minZ: -1, maxZ: 3, normal: vec3(0, 1, 0) },
                    { minX: -35, maxX: -15, minY: -1, maxY: 1, minZ: -1, maxZ: 3, normal: vec3(0, 1, 0) },
                    { minX: -16, maxX: -14, minY: -21, maxY: 1, minZ: -1, maxZ: 3, normal: vec3(1, 0, 0) },
                    { minX: 2, maxX: 4, minY: -21, maxY: 1, minZ: -1, maxZ: 3, normal: vec3(-1, 0, 0) },
                    { minX: 2, maxX: 22, minY: -1, maxY: 1, minZ: -1, maxZ: 3, normal: vec3(0, 1, 0) },
                    { minX: 2, maxX: 4, minY: 17, maxY: 39, minZ: -1, maxZ: 3, normal: vec3(-1, 0, 0) },
                    { minX: 2, maxX: 22, minY: 17, maxY: 19, minZ: -1, maxZ: 3, normal: vec3(0, -1, 0) },
                    { minX: -16, maxX: -14, minY: 17, maxY: 39, minZ: -1, maxZ: 3, normal: vec3(1, 0, 0) },
                    { minX: -35, maxX: -15, minY: 17, maxY: 19, minZ: -1, maxZ: 3, normal: vec3(0, -1, 0) }
                ],
                red_obstacles: [
                    { minX: 4, maxX: 14, minY: -8.5, maxY: -7.5, minZ: 0, maxZ: 2, normal: vec3(0, 1, 0), isDangerous: true },
                    { minX: 12, maxX: 22, minY: -12.5, maxY: -11.5, minZ: 0, maxZ: 2, normal: vec3(0, 1, 0), isDangerous: true },
                    { minX: 11, maxX: 23, minY: 27.75, maxY: 28.25, minZ: 0, maxZ: 2, normal: vec3(0, -1, 0), isDangerous: true },
                    { minX: -34, maxX: -22, minY: 27.75, maxY: 28.25, minZ: 0, maxZ: 2, normal: vec3(0, -1, 0), isDangerous: true }
                ],
                obstacle_positions: [
                    { translation: [-35, 10, 1], scale: [1, 30, 2], rotation: [0, 0, 0] },
                    { translation: [23, 10, 1], scale: [1, 30, 2], rotation: [0, 0, 0] },
                    { translation: [-6, 40, 1], scale: [30, 1, 2], rotation: [0, 0, 0] },
                    { translation: [-6, -20, 1], scale: [30, 1, 2], rotation: [0, 0, 0] },
                    { translation: [-25, 0, 1], scale: [10, 1, 2], rotation: [0, 0, 0] },
                    { translation: [-15, -10, 1], scale: [1, 11, 2], rotation: [0, 0, 0] },
                    { translation: [3, -10, 1], scale: [1, 11, 2], rotation: [0, 0, 0] },
                    { translation: [12, 0, 1], scale: [10, 1, 2], rotation: [0, 0, 0] },
                    { translation: [3, 28, 1], scale: [1, 11, 2], rotation: [0, 0, 0] },
                    { translation: [12, 18, 1], scale: [10, 1, 2], rotation: [0, 0, 0] },
                    { translation: [-15, 28, 1], scale: [1, 11, 2], rotation: [0, 0, 0] },
                    { translation: [-25, 18, 1], scale: [10, 1, 2], rotation: [0, 0, 0] }
                ],
                red_obstacle_positions: [
                    { translation: [9, -8, 1], scale: [5, .5, 1], rotation: [0, 0, 0] },
                    { translation: [17, -12, 1], scale: [5, .5, 1], rotation: [0, 0, 0] },
                    { translation: [17, 28, 1], scale: [6, .5, 1], rotation: [0, 0, 0] },
                    { translation: [-28, 28, 1], scale: [6, .5, 1], rotation: [0, 0, 0] }
                ],
                hole_position: vec3(40, 30, 0),
                ball_start_position: vec3(-6, 10, 1)
            }
        ];
        this.current_level = 0;
        this.init_level(this.current_level);

        this.materials = {
            ball: new Material(new defs.Phong_Shader(), { ambient: 0.4, diffusivity: 1, specularity: 0.5, color: hex_color("#ffffff") }),
            green_terrain: new Material(new defs.Phong_Shader(), { ambient: 1, diffusivity: 1, specularity: 0, color: hex_color("#8CC084") }),
            obstacle: new Material(new defs.Phong_Shader(), { ambient: 0.5, diffusivity: 1, specularity: 0, color: hex_color("#8B4513") }),
            hole: new Material(new defs.Phong_Shader(), { ambient: 1, diffusivity: 0.5, specularity: 0.5, color: hex_color("#000000") }),
            arrow: new Material(new defs.Phong_Shader(), { ambient: 1, diffusivity: 0, specularity: 0, color: hex_color("#ff0000") }),
            line: new Material(new defs.Basic_Shader()),
            red_obstacle: new Material(new defs.Phong_Shader(), { ambient: 0.8, diffusivity: 1, specularity: 0, color: hex_color("#FF0000") }),
            coin: new Material(new defs.Phong_Shader(), { ambient: 0.95, diffusivity: 0.8, specularity: 0.5, color: hex_color("#FFD700") })
        };

        this.camera_mode = 'third_person';
        this.initial_camera_location = Mat4.look_at(vec3(0, -40, 50), vec3(0, 0, 0), vec3(0, 0, 1));
        this.ball_position = vec3(-10, 20, 1);
        this.ball_velocity = vec3(0, 0, 0);
        this.aim_direction = vec3(1, 0, 0);
        this.speed = 25;
        this.aim_speed = 0.05;
        this.friction = 0.98;
        this.enter_press_time = null;
        this.enter_release_time = null;
        this.isEnterPressed = false;
        this.maxSpeed = 50;
        this.potentialVelocity = 0;
        this.fluctuationAmplitude = 25;
        this.fluctuationFrequency = 2;
        this.strokes = 0;
        this.hole_radius = 1;
        this.ball_radius = 1;
        this.coin_radius = 1;
        this.coins = [];
        this.collected_coins = 0;
        this.tp_transforms = [];
        this.tp_materials = [];
        this.coin_rotation = 0;
        const fixedPositions = [
            { x: -6, y: 30 }, { x: -30, y: -15 },
            { x: -20, y: -4 }, { x: 18, y: 35 },
            { x: 7, y: 25 }, { x: -30, y: 35 },
            { x: -20, y: 25 }, { x: 8, y: -4 },
            { x: 18, y: -15 }, { x: 40, y: 10 }
        ];
        const colors = [
            hex_color("#FAFF70"), hex_color("#4FA3F8"), hex_color("#3DA739"),
            hex_color("#B896C5"), hex_color("#FFCAD4")
        ];
        fixedPositions.forEach((position, index) => {
            const colorIndex = Math.floor(index / 2) % colors.length;
            const material = new Material(new defs.Phong_Shader(), {
                ambient: 1, diffusivity: 0.5, specularity: 0.5, color: colors[colorIndex]
            });
            const tp_transform = Mat4.identity()
                .times(Mat4.translation(position.x, position.y, 0))
                .times(Mat4.scale(1, 1, 0.1));
            this.tp_transforms.push(tp_transform);
            this.tp_materials.push(material);
        });

        this.coins = [
            vec3(-10, -12, 1),
            vec3(11, -4, 1),
            vec3(2, -21, 1)
        ];
        this.collected_coins = 0;

        this.key_state = { ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false, Enter: false };
        this.canvas = document.querySelector('#main-canvas');
        this.attach_event_listeners();
    }

    make_control_panel() {
        this.live_string(box => {
            box.textContent = "Strokes: " + this.strokes;
        });
        this.new_line();
        this.live_string(box => {
            box.textContent = "Coins Collected: " + this.collected_coins;
        });
        this.new_line();
        this.key_triggered_button("Aim Up", ["ArrowUp"], () => this.key_state.ArrowUp = true, undefined, () => this.key_state.ArrowUp = false);
        this.new_line();
        this.key_triggered_button("Aim Left", ["ArrowLeft"], () => this.key_state.ArrowLeft = true, undefined, () => this.key_state.ArrowLeft = false);
        this.key_triggered_button("Aim Down", ["ArrowDown"], () => this.key_state.ArrowDown = true, undefined, () => this.key_state.ArrowDown = false);
        this.key_triggered_button("Aim Right", ["ArrowRight"], () => this.key_state.ArrowRight = true, undefined, () => this.key_state.ArrowRight = false);
        this.key_triggered_button("Shoot", ["Enter"], () => {
            if (!this.isEnterPressed && this.isBallStationary()) {
                this.isEnterPressed = true;
                this.enter_press_time = Date.now();
            }
        }, undefined, () => {
            if (this.isEnterPressed && this.isBallStationary()) {
                this.isEnterPressed = false;
                this.ball_velocity = this.aim_direction.times(this.potentialVelocity);
                this.potentialVelocity = 0;
                this.strokes += 1;
                this.enter_release_time = Date.now();
            }
        });
        this.new_line();
        this.key_triggered_button("Change View", ["Shift"], () => {
            this.camera_mode = (this.camera_mode === 'third_person') ? 'first_person' : 'third_person';
        });
    }

    isBallStationary() {
        return this.ball_velocity.norm() === 0;
    }

    update_aim_direction(dt) {
        let change = false;
        if (this.key_state.ArrowUp) {
            this.aim_direction = this.aim_direction.plus(vec3(0, this.aim_speed, 0));
            change = true;
        }
        if (this.key_state.ArrowDown) {
            this.aim_direction = this.aim_direction.plus(vec3(0, -this.aim_speed, 0));
            change = true;
        }
        if (this.key_state.ArrowLeft) {
            this.aim_direction = this.aim_direction.plus(vec3(-this.aim_speed, 0, 0));
            change = true;
        }
        if (this.key_state.ArrowRight) {
            this.aim_direction = this.aim_direction.plus(vec3(this.aim_speed, 0, 0));
            change = true;
        }
        if (change) {
            this.aim_direction.normalize();
        }
    }

    init_level(level_index) {
        const level = this.levels[level_index];
        this.obstacles = level.obstacles;
        this.obstacle_positions = level.obstacle_positions;
        this.red_obstacle_positions = level.red_obstacle_positions;
        this.hole_position = level.hole_position;
        this.ball_position = level.ball_start_position;
        this.ball_velocity = vec3(0, 0, 0);
        this.strokes = 0;

        // Initialize coins for the current level
        if (level_index === 0) {
            this.coins = [
                vec3(-10, -12, 1),
                vec3(11, -4, 1),
                vec3(2, -21, 1)
            ];
        }
        else if (level_index === 1) {
            this.coins = [
                vec3(-20, 7, 1),
                vec3(10, -5, 1),
                vec3(-8, 21, 1),
                vec3(0, 8, 1),
                vec3(15, 5, 1)
            ];
        } else if (level_index === 2) {
            this.coins = [
                vec3(15, 10, 1),
                vec3(-20, -10, 1),
                vec3(15, -10, 1),
                vec3(-19, 29, 1),
                vec3(0, 15, 1)
            ];
        }

        this.collected_coins = 0;
        console.log("Initialized level with coins:", this.coins);
    }

    generate_coins(num_coins) {
        const coins = [];
        const bounds = { minX: -15, maxX: 15, minY: -25, maxY: 25 };
        while (coins.length < num_coins) {
            let x = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
            let y = Math.random() * (bounds.maxY - bounds.minY) + bounds.minY;
            let valid = true;
            for (let obstacle of this.obstacles) {
                if (x > obstacle.minX && x < obstacle.maxX && y > obstacle.minY && y < obstacle.maxY) {
                    valid = false;
                    break;
                }
            }
            if (valid) {
                coins.push(vec3(x, y, 1));
            }
        }
        return coins;
    }

    update_potential_velocity() {
        if (this.isEnterPressed && this.enter_press_time) {
            const currentTime = Date.now();
            const pressDuration = (currentTime - this.enter_press_time) / 1000;
            this.potentialVelocity = this.speed + this.fluctuationAmplitude * Math.sin(this.fluctuationFrequency * Math.PI * pressDuration);
            this.potentialVelocity = Math.abs(this.potentialVelocity);
        } else {
            this.potentialVelocity = 0;
        }
    }

    release_ball() {
        if (this.key_state.Enter) {
            this.ball_velocity = this.aim_direction.times(this.speed);
        }
    }


    attach_event_listeners() {
        this.canvas.addEventListener('mouseup', () => {
            this.dragging = false;
        });
        document.addEventListener('DOMContentLoaded', () => {
            const restartButton = document.getElementById('rs'); // Make sure your button has an id
            if (restartButton) {
                restartButton.addEventListener('click', () => this.restartGame());
            }
        });
    }

    ndcToWorld(ndcX, ndcY, program_state) {
        const ndcPos = vec4(ndcX, ndcY, 1, 1);
        const inverseProj = Mat4.inverse(program_state.projection_transform);
        const inverseView = Mat4.inverse(program_state.camera_transform);
        let worldPos = inverseView.times(inverseProj).times(ndcPos);
        return worldPos.to3().normalized();
    }

    isCollidingWithDangerous() {
        const sphere = { c: this.ball_position, r: this.ball_radius };
        for (let obstacle of this.levels[this.current_level].red_obstacles) {
            const aabb = {
                minX: obstacle.minX,
                maxX: obstacle.maxX,
                minY: obstacle.minY,
                maxY: obstacle.maxY,
                minZ: obstacle.minZ,
                maxZ: obstacle.maxZ,
                normal: obstacle.normal
            };
            if (this.testSphereAABB(sphere, aabb)) {
                return obstacle;
            }
        }
        return null;
    }

    isColliding() {
        const sphere = {
            c: this.ball_position,
            r: this.ball_radius
        };

        for (let obstacle of this.obstacles) {
            const aabb = {
                minX: obstacle.minX,
                maxX: obstacle.maxX,
                minY: obstacle.minY,
                maxY: obstacle.maxY,
                minZ: obstacle.minZ,
                maxZ: obstacle.maxZ,
                normal: obstacle.normal
            };
            if (this.testSphereAABB(sphere, aabb)) {
                console.log("Collision detected with obstacle");
                return aabb;
            }
        }
        return null;
    }

    testSphereAABB(s, b) {
        let p = this.closestPtPointAABB(s.c, b);
        let v = {
            x: p.x - s.c[0],
            y: p.y - s.c[1],
            z: p.z - s.c[2]
        };

        return this.dotProduct(v, v) <= s.r * s.r;
    }

    closestPtPointAABB(p, b) {
        return {
            x: Math.max(b.minX, Math.min(p[0], b.maxX)),
            y: Math.max(b.minY, Math.min(p[1], b.maxY)),
            z: Math.max(b.minZ, Math.min(p[2], b.maxZ))
        };
    }

    dotProduct(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }

    updatePhysics(dt) {
        if (this.game_over) return;

        const obstacle = this.isColliding();
        if (obstacle) {
            const N = obstacle.normal;
            const I = this.ball_velocity;
            const dotProduct = I.dot(N);
            const reflection = I.minus(N.times(2 * dotProduct));
            this.ball_velocity = reflection;
        }

        this.coin_rotation += 2 * Math.PI / 6 * dt; // Rotate 60 degrees per second
        this.coin_rotation %= 2 * Math.PI; // Keep the angle within a 0-2π range

        if (this.current_level == 2) {
            const dangerousObstacle = this.isCollidingWithDangerous();
            if (dangerousObstacle) {
                this.ball_position = this.levels[this.current_level].ball_start_position;
                this.ball_velocity = vec3(0, 0, 0);
                console.log("Hit a dangerous obstacle, resetting position.");
            }

            this.handleTeleportation();
        }

        if (this.ball_velocity.norm() > 0) {
            const friction = 0.98;
            this.ball_velocity = this.ball_velocity.times(friction);
            this.ball_position = this.ball_position.plus(this.ball_velocity.times(dt));
            if (this.ball_velocity.norm() < 0.1) {
                this.ball_velocity = vec3(0, 0, 0);
                console.log("Ball stopped");
            }
            this.check_for_victory();
            this.check_for_coin_collection();
        }
    }

    handleTeleportation() {
        for (let i = 0; i < this.tp_transforms.length; i += 2) {
            if (i + 1 >= this.tp_transforms.length) break;
            const teleportFrom = this.tp_transforms[i].times(vec4(0, 0, 1, 1)).to3();
            const teleportTo = this.tp_transforms[i + 1].times(vec4(0, 0, 1, 1)).to3();
            const distanceToTeleportFrom = this.ball_position.minus(teleportFrom).norm();
            teleportTo[2] = 1;
            if (distanceToTeleportFrom <= this.ball_radius + this.hole_radius) {
                this.ball_position = teleportTo;
                this.ball_velocity = vec3(0, 0, 0);
                console.log("Teleported from", teleportFrom, "to", teleportTo);
                break;
            }
        }
    }

    check_for_coin_collection() {
        this.coins = this.coins.filter(coin => {
            const distance = this.ball_position.minus(coin).norm();
            if (distance < this.ball_radius + this.coin_radius) {
                this.collected_coins += 1;
                return false;
            }
            return true;
        });
    }

    check_for_victory() {
        const distance_to_hert = this.ball_position.minus(this.hole_position).norm();
        if (distance_to_hert < this.ball_radius + this.hole_radius) {
            alert(`Congratulations! You've won level ${this.current_level + 1} in ${this.strokes} strokes! Coins collected: ${this.collected_coins}`);
            this.current_level++;
            if (this.current_level < this.levels.length) {
                this.init_level(this.current_level);
            } else {
                this.game_completed = true;
                this.display_win_screen();
            }
        }
    }

    display_win_screen() {
        console.log('win screen called')
        const winScreen = document.getElementById('winScreen');
        const winMessage = document.getElementById('winMessage');
        winMessage.textContent = `Congratulations! You have completed all levels with ${this.strokes} strokes and collected ${this.collected_coins} coins!`;
        winScreen.style.display = 'block'; // Show the win screen
    }

    restartGame() {
        this.game_completed = false;
        this.current_level = 0;
        this.init_level(this.current_level);
        document.getElementById('winScreen').style.display = 'none'; // Hide the win screen
        // Reset other necessary states of your game
    }
    display(context, program_state) {
        this.current_program_state = program_state;

        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 0.1, 100);

        const light_position = vec4(0, 10, 0, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        const t = program_state.animation_time / 1000;
        const dt = program_state.animation_delta_time / 1000;

        this.update_aim_direction(dt);
        this.release_ball();
        this.updatePhysics(dt);

        const ball_transform = Mat4.identity().times(Mat4.translation(...this.ball_position));
        this.shapes.ball.draw(context, program_state, ball_transform, this.materials.ball);

        this.update_potential_velocity();

        if (this.ball_velocity.norm() === 0 && !this.isEnterPressed) {
            const lineLength = 7;
            const arrow_transform = Mat4.identity()
                .times(Mat4.translation(...this.ball_position.plus(this.aim_direction.times(lineLength / 2 + 4))))
                .times(Mat4.rotation(Math.atan2(this.aim_direction[1], this.aim_direction[0]), 0, 0, 1))
                .times(Mat4.scale(lineLength, 0.1, 0.1));
            this.shapes.arrow.draw(context, program_state, arrow_transform, this.materials.arrow);

            const arrowhead_transform = Mat4.identity()
                .times(Mat4.translation(...this.ball_position.plus(this.aim_direction.times(lineLength + 7))))
                .times(Mat4.rotation(Math.atan2(this.aim_direction[1], this.aim_direction[0]), 0, 0, 1))
                .times(Mat4.rotation(Math.PI / 2, 0, 1, 0))
                .times(Mat4.scale(0.5, 0.5, 0.5));
            this.shapes.arrowhead.draw(context, program_state, arrowhead_transform, this.materials.arrow);
        }

        if (this.isEnterPressed) {
            const lineLength = this.potentialVelocity / this.maxSpeed * 9;
            const arrow_transform = Mat4.identity()
                .times(Mat4.translation(...this.ball_position.plus(this.aim_direction.times((lineLength + 6) / 2))))
                .times(Mat4.rotation(Math.atan2(this.aim_direction[1], this.aim_direction[0]), 0, 0, 1))
                .times(Mat4.scale(lineLength, 0.1, 0.1));
            this.shapes.arrow.draw(context, program_state, arrow_transform, this.materials.arrow);

            const arrowhead_transform = Mat4.identity()
                .times(Mat4.translation(...this.ball_position.plus(this.aim_direction.times(lineLength * 1.7 + 2.2))))
                .times(Mat4.rotation(Math.atan2(this.aim_direction[1], this.aim_direction[0]), 0, 0, 1))
                .times(Mat4.rotation(Math.PI / 2, 0, 1, 0))
                .times(Mat4.scale(0.5, 0.5, 0.5));
            this.shapes.arrowhead.draw(context, program_state, arrowhead_transform, this.materials.arrow);
        }

        const hole_transform = Mat4.identity().times(Mat4.translation(...this.hole_position)).times(Mat4.scale(1, 1, 0.1));
        this.shapes.hole.draw(context, program_state, hole_transform, this.materials.hole);

        const terrain_transform = Mat4.identity().times(Mat4.translation(0, 0, 0)).times(Mat4.scale(80, 80, 1));
        this.shapes.plane.draw(context, program_state, terrain_transform, this.materials.green_terrain);

        for (let { translation, scale, rotation } of this.obstacle_positions) {
            let obstacle_transform = Mat4.identity()
                .times(Mat4.translation(...translation))
                .times(Mat4.rotation(rotation[1] * Math.PI / 180, 0, 0, 1))
                .times(Mat4.scale(...scale));
            this.shapes.obstacle.draw(context, program_state, obstacle_transform, this.materials.obstacle);
        }

        this.coins.forEach(coin => {
            const coin_transform = Mat4.identity()
                .times(Mat4.translation(...coin))
                .times(Mat4.rotation(Math.PI / 2, 1, 0, 0)) // Orient the coin to lie flat
                .times(Mat4.rotation(this.coin_rotation, 0, 1, 0)) // Apply rotation around the z-axis
                .times(Mat4.scale(this.coin_radius, this.coin_radius, 0.1)); // Scale to the appropriate coin size
            this.shapes.coin.draw(context, program_state, coin_transform, this.materials.coin);
        });

        if (this.current_level == 2) {
            for (let i = 0; i < this.tp_transforms.length; i++) {
                this.shapes.hole.draw(context, program_state, this.tp_transforms[i], this.tp_materials[i]);
            }
            for (let { translation, scale, rotation } of this.red_obstacle_positions) {
                let obstacle_transform = Mat4.identity()
                    .times(Mat4.translation(...translation))
                    .times(Mat4.rotation(rotation[1] * Math.PI / 180, 0, 0, 1))
                    .times(Mat4.scale(...scale));
                this.shapes.obstacle.draw(context, program_state, obstacle_transform, this.materials.red_obstacle);
            }
        }

       // Determine camera position based on camera_mode
    if (this.camera_mode === 'first_person') {
        const ball_camera_position = this.ball_position.plus(vec3(0, 0, 2));
        const ball_camera_target = this.ball_position.plus(this.aim_direction.times(10));
        program_state.set_camera(Mat4.look_at(ball_camera_position, ball_camera_target, vec3(0, 0, 1)));
    } else {
        program_state.set_camera(this.initial_camera_location);
    }

        this.shapes.hole.draw(context, program_state, hole_transform, this.materials.hole);
    }
}