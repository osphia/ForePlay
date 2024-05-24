import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

class Line extends Shape {
    constructor() {
        super("positions", "colors");

        this.arrays.positions = [vec3(0, 0, 0), vec3(1, 0, 0)];
        this.arrays.colors = [color(1, 0, 0, 1), color(1, 0, 0, 1)];

        this.indices.push(0, 1);
    }
}

export class Main extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            ball: new defs.Subdivision_Sphere(4), 
            plane: new defs.Square(), 
            obstacle: new defs.Cube(), 
            hole: new defs.Subdivision_Sphere(4),
            arrow: new defs.Axis_Arrows(),
            line: new Line(),
        };

        this.obstacles = [
            {
                minX: -15.5, maxX: -14.5, minY: -12.5, maxY: 12.5, minZ: 0, maxZ: 2,
                normal: vec3(1, 0, 0)  // Normal pointing right
            },
            {
                minX: -7.5, maxX: 7.5, minY: -25.5, maxY: -24.5, minZ: 0, maxZ: 2,
                normal: vec3(0, 1, 0)  // Normal pointing upwards
            },
            {
                minX: 14.5, maxX: 15.5, minY: -12.5, maxY: 12.5, minZ: 0, maxZ: 2,
                normal: vec3(-1, 0, 0) // Normal pointing left
            },
            {
                minX: -13, maxX: -7, minY: 24.5, maxY: 25.5, minZ: 0, maxZ: 2,
                normal: vec3(0, -1, 0) // Normal pointing downwards
            },
            {
                minX: 7, maxX: 13, minY: 24.5, maxY: 25.5, minZ: 0, maxZ: 2,
                normal: vec3(0, -1, 0) // Normal pointing downwards
            },
            {
                minX: -5.5, maxX: -4.5, minY: -5, maxY: 15, minZ: 0, maxZ: 2,
                normal: vec3(1, 0, 0)  // Normal pointing right
            },
            {
                minX: 4.5, maxX: 5.5, minY: -5, maxY: 15, minZ: 0, maxZ: 2,
                normal: vec3(-1, 0, 0) // Normal pointing left
            },
            {
                minX: -2.5, maxX: 2.5, minY: -14.5, maxY: -13.5, minZ: 0, maxZ: 2,
                normal: vec3(0, 1, 0)  // Normal pointing upwards
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
                {ambient: 1, diffusivity: 0.5, specularity: 0.5, color: hex_color("#ff0000")}),
            line: new Material(new defs.Basic_Shader()),
        };

        this.initial_camera_location = Mat4.look_at(vec3(0, -40, 50), vec3(0, 0, 0), vec3(0, 0, 1)); 
        
        
        this.ball_position = vec3(-10, 20, 1);  // Assuming these are the initial coordinates of the ball
        this.ball_velocity = vec3(0, 0, 0);     // Initialize with zero velocity
        this.ballRadius = 4;
        this.aim_direction = vec3(1, 0, 0); // Initial aim direction
        this.speed = 25;
        this.aim_speed = 0.05; // Speed at which the aim direction changes
        this.friction = 0.98; // Friction coefficient to slow down ball

        // Your other initializations...
        // Track time when Enter is pressed
        this.enter_press_time = null;
        this.enter_release_time = null;
        this.current_speed = this.base_speed;

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
                case 'Enter':
                    this.key_state.Enter = true;
                    event.preventDefault(); // Prevent default behavior
                    break;
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
                case 'Enter':
                    this.key_state.Enter = false;
                    event.preventDefault(); // Prevent default behavior
                    break;
            }
        });
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("View golf course", ["Control", "0"], () => this.attached = () => null);
    }

    update_aim_direction(deltaTime) {
        // Update aim direction based on key state
        if (this.key_state.ArrowUp) this.aim_direction = this.aim_direction.plus(vec3(0, this.aim_speed, 0)).normalized();
        if (this.key_state.ArrowDown) this.aim_direction = this.aim_direction.plus(vec3(0, -this.aim_speed, 0)).normalized();
        if (this.key_state.ArrowLeft) this.aim_direction = this.aim_direction.plus(vec3(-this.aim_speed, 0, 0)).normalized();
        if (this.key_state.ArrowRight) this.aim_direction = this.aim_direction.plus(vec3(this.aim_speed, 0, 0)).normalized();
    }

    release_ball() {
        // Set ball velocity to aim direction multiplied by speed when enter is pressed
        if (this.key_state.Enter) {
            this.ball_velocity = this.aim_direction.times(this.speed);
        }
    }

    // update_ball_position(deltaTime) {
    //     const steps = 10; // Number of steps for sub-stepping the movement
    //     const step_dt = deltaTime / steps;

    //     for (let i = 0; i < steps; i++) {
    //         this.ball_position = this.ball_position.plus(this.ball_velocity.times(step_dt));
    //         //this.check_collision_with_obstacles();
    //         this.ball_velocity = this.ball_velocity.times(this.friction);

    //         if (this.ball_velocity.norm() < 0.01) {
    //             this.ball_velocity = vec3(0, 0, 0);
    //         }
    //     }
    // }

    //added
    attach_event_listeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Convert screen coordinates to NDC
            const ndcX = (mouseX / this.canvas.width) * 2 - 1;
            const ndcY = -(mouseY / this.canvas.height) * 2 + 1;

            // Use the stored program_state to convert NDC to world coordinates
            const worldPoint = this.ndcToWorld(ndcX, ndcY, this.current_program_state);

            // // Check if clicking on the ball
            // if (this.isClickOnBall(worldPoint)) {
            //     console.log("click");
            //     this.dragging = true;
            //     this.initiateBallRoll();
            // }
            console.log("click");
            this.initiateBallRoll();
        });
    
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
    
    isClickOnBall(worldPoint) {
        const distance = worldPoint.minus(this.ball_position).norm();
        return distance <= this.ballRadius; 
    }

    initiateBallRoll() {
        // Set initial velocity
        console.log("Rolling the ball with initial velocity");
        if (this.ball_velocity.norm() === 0) {  // Ensure velocity is only set if it's currently zero
            this.ball_velocity = vec3(0, -40, 0); // Example: Roll to the right
        }
    }
    
    isColliding() {
        for (let obstacle of this.obstacles) {
            // Calculate the closest point on the cuboid to the ball's center
            let closestPoint = vec3(
                Math.max(obstacle.minX, Math.min(this.ball_position[0], obstacle.maxX)),
                Math.max(obstacle.minY, Math.min(this.ball_position[1], obstacle.maxY)),
                Math.max(obstacle.minZ, Math.min(this.ball_position[2], obstacle.maxZ))
            );
    
            // Calculate the distance from the closest point to the ball's center
            let distance = closestPoint.minus(this.ball_position).norm();

            // console.log(distance);
            // Check if the distance is less than the radius of the ball
            if (distance < this.ballRadius) {
                console.log("Collision detected with obstacle");
    
                // Adjust the ball's position to be exactly on the boundary of the obstacle
                let overlap = this.ballRadius - distance;
                let correctionVector = this.ball_position.minus(closestPoint).normalized().times(overlap);
                this.ball_position = this.ball_position.plus(correctionVector);
    
                return obstacle;  // Returns the obstacle that was hit
            }
        }
        return null;  // No collision detected
    }
    
    updatePhysics(deltaTime) {
        if (this.game_over) return; // Stop updating if the game is over

        const obstacle = this.isColliding();
        if (obstacle) {
            // Reflect the ball's velocity based on the obstacle's normal
            const N = obstacle.normal;
            const I = this.ball_velocity;
            const dotProduct = I.dot(N);
            const reflection = I.minus(N.times(2 * dotProduct));
            this.ball_velocity = reflection;
        }

        if (this.ball_velocity.norm() > 0) {  // Check if the velocity vector is non-zero
            const friction = 0.98;
            this.ball_velocity = this.ball_velocity.times(friction);
    
            // Update position
            this.ball_position = this.ball_position.plus(this.ball_velocity.times(deltaTime));
            
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
            alert("Congratulations! You've won the game!");
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
        const deltaTime = program_state.animation_delta_time / 1000; // Convert ms to seconds
        // const dt = program_state.animation_delta_time / 1000;

        // Check if the game is over
        if (this.game_over) {
            // Display the winning message
            const canvas = context.canvas;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous frames

            ctx.font = "48px serif";
            ctx.fillStyle = "green";
            ctx.textAlign = "center";
            ctx.fillText("Congratulations! You have won!", canvas.width / 2, canvas.height / 2);

        return; // Stop rendering the rest of the scene
        }

        // Update aim direction and release ball if enter is pressed
        this.update_aim_direction(deltaTime);
        this.release_ball();
    
        // Update ball position
        // this.update_ball_position(deltaTime);
        this.updatePhysics(deltaTime);
        
    
        // Position the ball
        const ball_transform3 = Mat4.identity().times(Mat4.translation(...this.ball_position));
    
        // Create the aim line transform
        const aim_line_transform = Mat4.identity()
            .times(Mat4.translation(...this.ball_position))
            .times(Mat4.rotation(Math.atan2(this.aim_direction[1], this.aim_direction[0]), 0, 0, 1))
            .times(Mat4.scale(1, 0.1, 0.1));  // Adjust length and thickness as needed
    
        // Draw the ball
        this.shapes.ball.draw(context, program_state, ball_transform3, this.materials.ball);
    
        // Draw the aim line
        this.shapes.line.draw(context, program_state, aim_line_transform, this.materials.line);

        // Position the ball at the tip of the left side of the U
        let ball_transform = Mat4.identity().times(Mat4.translation(-10, 20, 1));
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
            //Inner middle horizontal obstacle
            {translation: [0, -14, 1], scale: [5, 1, 2]}
        ];

        for (let {translation, scale} of obstacle_positions) {
            let obstacle_transform = Mat4.identity()
                .times(Mat4.translation(...translation))
                .times(Mat4.scale(...scale));
            this.shapes.obstacle.draw(context, program_state, obstacle_transform, this.materials.obstacle);
        }

        // Draw the hole (larger size to match the ball)
        this.shapes.hole.draw(context, program_state, hole_transform, this.materials.hole);

        if (this.ball_velocity.norm > 0) {
            console.log(this.ball_velocity);
        }
        
        this.updatePhysics(deltaTime);

        ball_transform = Mat4.translation(...this.ball_position);
        this.shapes.ball.draw(context, program_state, ball_transform, this.materials.ball);
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