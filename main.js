import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;



export class Main extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // State variables for 

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            ball: new defs.Subdivision_Sphere(4), 
            plane: new defs.Square(), 
            obstacle: new defs.Cube(), 
            hole: new defs.Subdivision_Sphere(4),
            arrow: new defs.Cube(),
            fullscreen_quad: new defs.Square(),
        };

        this.obstacles = [
            // Left side vertical obstacle
            {
                minX: -16, maxX: -14, minY: -25, maxY: 25, minZ: -1, maxZ: 3,
                normal: vec3(1, 0, 0)  // Normal pointing right
            },
            // Bottom horizontal obstacle
            {
                minX: -15, maxX: 15, minY: -26, maxY: -24, minZ: -1, maxZ: 3,
                normal: vec3(0, 1, 0)  // Normal pointing up
            },
            // Right side vertical obstacle
            {
                minX: 14, maxX: 16, minY: -25, maxY: 25, minZ: -1, maxZ: 3,
                normal: vec3(-1, 0, 0) // Normal pointing left
            },
            // Top left horizontal obstacle
            {
                minX: -16, maxX: -4, minY: 24, maxY: 26, minZ: -1, maxZ: 3,
                normal: vec3(0, -1, 0) // Normal pointing down
            },
            // Top right horizontal obstacle
            {
                minX: 4, maxX: 16, minY: 24, maxY: 26, minZ: -1, maxZ: 3,
                normal: vec3(0, -1, 0) // Normal pointing down
            },
            // Inner left vertical obstacle
            {
                minX: -6, maxX: -4, minY: -15, maxY: 25, minZ: -1, maxZ: 3,
                normal: vec3(1, 0, 0)  // Normal pointing right
            },
            // Inner right vertical obstacle
            {
                minX: 4, maxX: 6, minY: -15, maxY: 25, minZ: -1, maxZ: 3,
                normal: vec3(-1, 0, 0) // Normal pointing left
            },
            // Inner middle horizontal obstacle
            {
                minX: -6, maxX: 6, minY: -15, maxY: -13, minZ: -1, maxZ: 3,
                normal: vec3(0, 1, 0)  // Normal pointing up
            }
        ];
        
        
        
        
        

        // *** Materials
        this.materials = {
            ball: new Material(new defs.Phong_Shader(),
                {ambient: 0.4, diffusivity: 1, specularity: 0.5, color: hex_color("#ffffff")}),
            green_terrain: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, specularity: 0, color: hex_color("#8CC084")}),
            obstacle: new Material(new defs.Phong_Shader(),
                {ambient: 0.5, diffusivity: 1, specularity: 0, color: hex_color("#8B4513")}),
            hole: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0.5, specularity: 0.5, color: hex_color("#000000")}),
            arrow: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0, specularity: 0, color: hex_color("#ff0000")}),
            line: new Material(new defs.Basic_Shader()),
        };

        this.initial_camera_location = Mat4.look_at(vec3(0, -40, 50), vec3(0, 0, 0), vec3(0, 0, 1)); 
        
        
        this.ball_position = vec3(-10, 20, 1);  // Assuming these are the initial coordinates of the ball
        this.ball_velocity = vec3(0, 0, 0);     // Initialize with zero velocity
        this.ballRadius = 1;
        this.aim_direction = vec3(1, 0, 0); // Initial aim direction
        this.speed = 25;
        this.aim_speed = 0.05; // Speed at which the aim direction changes
        this.friction = 0.98; // Friction coefficient to slow down ball

        // Track time when Enter is pressed
        this.enter_press_time = null;
        this.enter_release_time = null;
        // this.current_speed = this.base_speed;
        this.isEnterPressed = false;
        this.maxSpeed = 50;
        this.potentialVelocity = 0; 
        this.fluctuationAmplitude = 25; // Maximum deviation from the base speed
        this.fluctuationFrequency = 2;  // Frequency of the fluctuation
        this.strokes = 0;
        this.hole_position = vec3(10,20,1); // Position of hole
        this.hole_radius = 1;
        this.ball_radius = 1;

        this.key_state = {ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false, Enter: false};
        this.add_key_listener()

        this.canvas = document.querySelector('#main-canvas');
        this.attach_event_listeners();
    }

    add_key_listener() {
        window.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowUp':
                    this.key_state.ArrowUp = true;
                    event.preventDefault(); // Prevent default behavior
                    break;
                case 'ArrowLeft':
                    this.key_state.ArrowLeft = true;
                    event.preventDefault(); // Prevent default behavior
                    break;
                case 'ArrowDown':
                    this.key_state.ArrowDown = true;
                    event.preventDefault(); // Prevent default behavior
                    break;
                case 'ArrowRight':
                    this.key_state.ArrowRight = true;
                    event.preventDefault(); // Prevent default behavior
                    break;
            }
            if (event.key === 'Enter' && !this.isEnterPressed) {
                this.isEnterPressed = true;
                this.enter_press_time = Date.now();
                // event.preventDefault();
            }
        });

        window.addEventListener('keyup', (event) => {
            switch (event.key) {
                case 'ArrowUp':
                    this.key_state.ArrowUp = false;
                    break;
                case 'ArrowLeft':
                    this.key_state.ArrowLeft = false;
                    break;
                case 'ArrowDown':
                    this.key_state.ArrowDown = false;
                    break;
                case 'ArrowRight':
                    this.key_state.ArrowRight = false;
                    break;
            }
            if (event.key === 'Enter' && this.isEnterPressed) {
                this.isEnterPressed = false;
                // Use the calculated potentialVelocity at the moment of release
                this.ball_velocity = this.aim_direction.times(this.potentialVelocity);
                this.enter_release_time = Date.now();
                this.potentialVelocity = 0;  // Reset after shooting
                this.strokes += 1;  // Increment the stroke count when the ball is shot
                // event.preventDefault();
            }
        });
    }

    make_control_panel() {
        // Display the stroke count
        this.live_string(box => {
            box.textContent = "Strokes: " + this.strokes;
        });
        this.new_line();
            // This button simulates pressing and releasing the up arrow key
            this.key_triggered_button("Move Up", ["ArrowUp"], () => this.key_state.ArrowUp = true, undefined, () => this.key_state.ArrowUp = false);
        
            // This button simulates pressing and releasing the left arrow key
            this.key_triggered_button("Move Left", ["ArrowLeft"], () => this.key_state.ArrowLeft = true, undefined, () => this.key_state.ArrowLeft = false);
        
            // This button simulates pressing and releasing the down arrow key
            this.key_triggered_button("Move Down", ["ArrowDown"], () => this.key_state.ArrowDown = true, undefined, () => this.key_state.ArrowDown = false);
        
            // This button simulates pressing and releasing the right arrow key
            this.key_triggered_button("Move Right", ["ArrowRight"], () => this.key_state.ArrowRight = true, undefined, () => this.key_state.ArrowRight = false);
        
            // This button simulates pressing and releasing the enter key to shoot 
            this.key_triggered_button("Shoot", ["Enter"], () => {
                if (!this.isEnterPressed) {
                    this.isEnterPressed = true;
                    this.enter_press_time = Date.now();
                }
                console.log(`Enter Pressed: ${this.isEnterPressed}, Time: ${this.enter_press_time}`);
            }, undefined, () => {
                if (this.isEnterPressed) {
                    this.isEnterPressed = false;
                    this.ball_velocity = this.aim_direction.times(this.potentialVelocity);
                    this.potentialVelocity = 0;  // Reset after shooting
                    this.strokes += 1;  // Increment the stroke count when the ball is shot
                    this.enter_release_time = Date.now();
                    console.log(`Velocity: ${this.ball_velocity}, Strokes: ${this.strokes}`);
                }
            });
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
            this.aim_direction.normalize(); // Ensure the direction vector is normalized
        }
    }

    update_potential_velocity() {
        if (this.isEnterPressed && this.enter_press_time) {
            const currentTime = Date.now();
            const pressDuration = (currentTime - this.enter_press_time) / 1000;
    
            // Calculating fluctuating velocity based on a sine wave
            this.potentialVelocity = this.speed + this.fluctuationAmplitude * Math.sin(this.fluctuationFrequency * Math.PI * pressDuration);
            this.potentialVelocity = Math.abs(this.potentialVelocity); // Ensure non-negative velocity for display and physics
        } else {
            this.potentialVelocity = 0;
        }
    }

    release_ball() {
        // Set ball velocity to aim direction multiplied by speed when enter is pressed
        if (this.key_state.Enter) {
            this.ball_velocity = this.aim_direction.times(this.speed);
        }
    }
    

    //added
    attach_event_listeners() { 
    
        this.canvas.addEventListener('mouseup', () => {
            this.dragging = false;
        });
    }
    
    ndcToWorld(ndcX, ndcY, program_state) {
        const ndcPos = vec4(ndcX, ndcY, 1, 1);
        const inverseProj = Mat4.inverse(program_state.projection_transform);
        const inverseView = Mat4.inverse(program_state.camera_transform);
        let worldPos = inverseView.times(inverseProj).times(ndcPos);
        return worldPos.to3().normalized(); // Ensure it is normalized
    }

    
    isColliding() {
        const sphere = {
            c: this.ball_position, // center of the sphere
            r: this.ball_radius    // radius of the sphere
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
    
            // Use the testSphereAABB method to check collision
            if (this.testSphereAABB(sphere, aabb)) {
                console.log("Collision detected with obstacle");
                return aabb; // Returns the obstacle that was hit
            }
        }
        return null; // No collision detected
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
        if (this.game_over) return; // Stop updating if the game is over

        const obstacle = this.isColliding();
        if (obstacle) console.log(obstacle);
        if (obstacle) {
            // Reflect the ball's velocity based on the obstacle's normal
            const N = obstacle.normal;
            const I = this.ball_velocity;
            const dotProduct = I.dot(N);
            const reflection = I.minus(N.times(2 * dotProduct));
            this.ball_velocity = reflection;
            console.log(N);
        }

        if (this.ball_velocity.norm() > 0) {  // Check if the velocity vector is non-zero
            const friction = 0.98;
            this.ball_velocity = this.ball_velocity.times(friction);
    
            // Update position
            this.ball_position = this.ball_position.plus(this.ball_velocity.times(dt));
            
            // Log current velocity for debugging
            // console.log("Current velocity:", this.ball_velocity);
    
            // Stop the ball if velocity is very low
            if (this.ball_velocity.norm() < 0.1) {
                this.ball_velocity = vec3(0, 0, 0);
                console.log("Ball stopped");
            }

            // Check for victory
            this.check_for_victory();
        }
    }
    //added fin    

    check_for_victory() {
        const distance_to_hole = this.ball_position.minus(this.hole_position).norm();
        if (distance_to_hole < this.ball_radius + this.hole_radius) {
            this.game_over = true;
            alert("Congratulations! You've won the game in " + this.strokes + " strokes!");
            this.strokes = 0;  // Reset strokes for a new game
        }
    }  

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        this.current_program_state = program_state;

        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(this.initial_camera_location);
        }
    
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 0.1, 100);
    
        const light_position = vec4(0, 10, 0, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        const t = program_state.animation_time / 1000;
        const dt = program_state.animation_delta_time / 1000; // Convert ms to seconds

        // Update aim direction and release ball if enter is pressed
        this.update_aim_direction(dt);
        this.release_ball();
        this.updatePhysics(dt);
        
        // Position the ball
        const ball_transform = Mat4.identity().times(Mat4.translation(...this.ball_position));
        this.shapes.ball.draw(context, program_state, ball_transform, this.materials.ball);

        this.update_potential_velocity();  // Update the potential velocity based on key press duration

        // Always draw aim line when ball is stationary
        if (this.ball_velocity.norm() === 0 && !this.isEnterPressed) {
            const lineLength =10;  // Normalize by maxSpeed for appropriate scaling
            const arrow_transform = Mat4.identity()
                .times(Mat4.translation(...this.ball_position.plus(this.aim_direction.times(lineLength / 2))))
                .times(Mat4.rotation(Math.atan2(this.aim_direction[1], this.aim_direction[0]), 0, 0, 1))
                .times(Mat4.scale(lineLength, 0.1, 0.1));
            this.shapes.arrow.draw(context, program_state, arrow_transform, this.materials.arrow);
        }

        if (this.isEnterPressed) {
            const lineLength =  this.potentialVelocity / this.maxSpeed * 10;
            const arrow_transform = Mat4.identity()
                .times(Mat4.translation(...this.ball_position.plus(this.aim_direction.times(lineLength / 2))))
                .times(Mat4.rotation(Math.atan2(this.aim_direction[1], this.aim_direction[0]), 0, 0, 1))
                .times(Mat4.scale(lineLength, 0.1, 0.1));
            this.shapes.arrow.draw(context, program_state, arrow_transform, this.materials.arrow);
        }

        // Position the hole at the tip of the right side of the U
        const hole_transform = Mat4.identity().times(Mat4.translation(10, 20, 0.05)).times(Mat4.scale(1, 1, 0.05));

        // Draw the U-shaped terrain
        const left_plane_transform = Mat4.identity().times(Mat4.translation(-10, 0, 0)).times(Mat4.scale(5, 25, 1));
        const bottom_plane_transform = Mat4.identity().times(Mat4.translation(0, -20, 0)).times(Mat4.scale(15, 5, 1));
        const right_plane_transform = Mat4.identity().times(Mat4.translation(10, 0, 0)).times(Mat4.scale(5, 25, 1));
    
        this.shapes.plane.draw(context, program_state, left_plane_transform, this.materials.green_terrain);
        this.shapes.plane.draw(context, program_state, bottom_plane_transform, this.materials.green_terrain);
        this.shapes.plane.draw(context, program_state, right_plane_transform, this.materials.green_terrain);
    
        // Draw obstacles to form a continuous border around the U
        const obstacle_positions = [
            // Left side vertical obstacle
            {translation: [-15, 0, 1], scale: [1, 25, 2]},
            // Bottom horizontal obstacle
            {translation: [0, -25, 1], scale: [15, 1, 2]},
            // Right side vertical obstacle
            {translation: [15, 0, 1], scale: [1, 25, 2]},
            // Top left horizontal obstacle
            {translation: [-10, 25, 1], scale: [6, 1, 2]},
            // Top right horizontal obstacle
            {translation: [10, 25, 1], scale: [6, 1, 2]},
            // Inner left vertical obstacle
            {translation: [-5, 5, 1], scale: [1, 20, 2]},
            // Inner right vertical obstacle
            {translation: [5, 5, 1], scale: [1, 20, 2]},
            // Inner middle horizontal obstacle
            {translation: [0, -14, 1], scale: [4, 1, 2]}
        ];
        


        for (let {translation, scale} of obstacle_positions) {
            let obstacle_transform = Mat4.identity()
                .times(Mat4.translation(...translation))
                .times(Mat4.scale(...scale));
            this.shapes.obstacle.draw(context, program_state, obstacle_transform, this.materials.obstacle);
        }
    
        // Draw the hole (larger size to match the ball)
        this.shapes.hole.draw(context, program_state, hole_transform, this.materials.hole);
    }
}

class Gouraud_Shader extends Shader {
    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        return ` 
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;

        varying vec3 N, vertex_worldspace;
        varying vec4 vertex_color;

        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;                            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;

                vertex_color = vec4(shape_color.xyz * ambient, shape_color.w);
                vertex_color.xyz += phong_model_lights (normalize(N), vertex_worldspace);
            } `;
    }

    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            void main(){
                gl_FragColor = vertex_color;
            } `;
    }

    send_material(gl, gpu, material) {
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}
