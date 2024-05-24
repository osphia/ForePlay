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

// Does not work yet
class PowerIndicator extends Shape {
    constructor() {
        super("positions", "colors");

        this.arrays.positions = [];
        this.arrays.colors = [];

        for (let i = 0; i <= 100; i++) {
            this.arrays.positions.push(vec3(i / 100, 0, 0));
            this.arrays.colors.push(color(0, 1, 0, 1)); // Green color
        }

        for (let i = 0; i < 100; i++) {
            this.indices.push(i, i + 1);
        }
    }
}

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
            hole: new defs.Subdivision_Sphere(1),
            arrow: new defs.Axis_Arrows(),
            line: new Line(),
            power_indicator: new PowerIndicator(),
        };

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
            power_indicator: new Material(new defs.Basic_Shader()),
        };

        this.initial_camera_location = Mat4.look_at(vec3(0, -40, 50), vec3(0, 0, 0), vec3(0, 0, 1)); 
    
        // Ball's initial position and velocity
        this.ball_position = vec3(-10,20,1);
        this.ball_velocity = vec3(0,0,0);
        this.aim_direction = vec3(1, 0, 0); // Initial aim direction
        this.base_speed = 50; // Base speed
        this.max_speed = 300; // max speed when holding Enter
        this.aim_speed = 0.2; // Speed at which the aim direction changes
        this.friction = 0.984; // Friction coefficient to slow down ball

        // Track time when Enter is pressed
        this.enter_press_time = null;
        this.enter_release_time = null;
        this.current_speed = this.base_speed;

        this.hole_position = vec3(10,20,1); // Position of hole
        this.hole_radius = 1;
        this.ball_radius = 1;
        
        // Keyboard controls
        this.key_state = {ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false, Enter: false};
        this.game_over = false; // Track game state
        this.add_key_listener()
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
                    if (this.enter_press_time === null) {
                        this.enter_press_time = performance.now();
                    }
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
                    if (this.enter_press_time !== null) {
                        this.enter_release_time = performance.now();
                        this.calculate_speed();
                        this.enter_press_time = null;
                    }
                    event.preventDefault(); // Prevent default behavior
                    break;
            }
        });
    }

    calculate_speed() {
        const hold_duration = (this.enter_release_time - this.enter_press_time) / 500; // Convert to seconds
        this.speed = Math.min(this.max_speed, this.base_speed + hold_duration * 10); // Adjust the multiplier as needed
    }

    make_control_panel() {
        this.key_triggered_button("View golf course", ["Control", "0"], () => this.attached = () => null);
        // Need to fix, other keys don't work
        // this.key_triggered_button("Aim Up", ["ArrowUp"], () => {
        //     this.key_state.ArrowUp = true;
        //     this.update_aim_direction(0.1);
        //     this.key_state.ArrowUp = false;
        // });
        // this.key_triggered_button("Aim Left", ["ArrowLeft"], () => {
        //     this.key_state.ArrowLeft = true;
        //     this.update_aim_direction(0.1);
        //     this.key_state.ArrowLeft = false;
        // });
        // this.key_triggered_button("Aim Down", ["ArrowDown"], () => {
        //     this.key_state.ArrowDown = true;
        //     this.update_aim_direction(0.1);
        //     this.key_state.ArrowDown = false;
        // });
        // this.key_triggered_button("Aim Right", ["ArrowRight"], () => {
        //     this.key_state.ArrowRight = true;
        //     this.update_aim_direction(0.1);
        //     this.key_state.ArrowRight = false;
        // });
        // this.key_triggered_button("Release Ball", ["Enter"], () => {
        //     this.key_state.Enter = true;
        //     this.release_ball();
        //     this.key_state.Enter = false;
        // });
    }

    update_aim_direction(dt) {
        // Update aim direction based on key state
        if (this.key_state.ArrowUp) this.aim_direction = this.aim_direction.plus(vec3(0, this.aim_speed, 0)).normalized();
        if (this.key_state.ArrowDown) this.aim_direction = this.aim_direction.plus(vec3(0, -this.aim_speed, 0)).normalized();
        if (this.key_state.ArrowLeft) this.aim_direction = this.aim_direction.plus(vec3(-this.aim_speed, 0, 0)).normalized();
        if (this.key_state.ArrowRight) this.aim_direction = this.aim_direction.plus(vec3(this.aim_speed, 0, 0)).normalized();
    }

    release_ball() {
        if (this.enter_release_time !== null) {
            this.ball_velocity = this.aim_direction.times(this.speed);
            this.enter_release_time = null; // Reset after release
        }
    }

    update_ball_position(dt) {
        if (this.game_over) return; // Stop updating if the game is over
    
        const steps = 10; // Number of steps for sub-stepping the movement
        const step_dt = dt / steps;
    
        for (let i = 0; i < steps; i++) {
            this.ball_position = this.ball_position.plus(this.ball_velocity.times(step_dt));
            this.ball_velocity = this.ball_velocity.times(this.friction);
    
            // Check for boundaries
            if (this.ball_position[0] < -20 || this.ball_position[0] > 20) {
                this.ball_position[0] = Math.max(-20, Math.min(20, this.ball_position[0]));
                this.ball_velocity[0] = -this.ball_velocity[0];
            }
            if (this.ball_position[1] < -20 || this.ball_position[1] > 20) {
                this.ball_position[1] = Math.max(-20, Math.min(20, this.ball_position[1]));
                this.ball_velocity[1] = -this.ball_velocity[1];
            }
    
            if (this.ball_velocity.norm() < 0.01) {
                this.ball_velocity = vec3(0, 0, 0);
            }
    
            // Check for victory
            this.check_for_victory();
        }
    }

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
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(this.initial_camera_location);
        }
    
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 0.1, 100);
    
        const light_position = vec4(0, 10, 0, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
    
        const dt = program_state.animation_delta_time / 1000;

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
        this.update_aim_direction(dt);
        this.release_ball();
    
        // Update ball position
        this.update_ball_position(dt);
    
        // Position the ball
        const ball_transform = Mat4.identity().times(Mat4.translation(...this.ball_position));
    
        // Create the aim line transform
        const aim_line_transform = Mat4.identity()
            .times(Mat4.translation(...this.ball_position))
            .times(Mat4.rotation(Math.atan2(this.aim_direction[1], this.aim_direction[0]), 0, 0, 1))
            .times(Mat4.scale(1, 0.1, 0.1));  // Adjust length and thickness as needed
    
        // Draw the ball
        this.shapes.ball.draw(context, program_state, ball_transform, this.materials.ball);
    
        // Draw the aim line
        this.shapes.line.draw(context, program_state, aim_line_transform, this.materials.line);
    
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
        const hole_transform = Mat4.identity().times(Mat4.translation(10, 20, 0.05)).times(Mat4.scale(1, 1, 0.05));
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

class Ring_Shader extends Shader {
    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));
    }

    shared_glsl_code() {
        return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        `;
    }

    vertex_glsl_code() {
        return this.shared_glsl_code() + `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
            center = model_transform * vec4(0.0, 0.0, 0.0, 1.0);
            point_position = model_transform * vec4(position, 1.0);
            gl_Position = projection_camera_model_transform * vec4(position, 1.0);          
        }`;
    }

    fragment_glsl_code() {
        return this.shared_glsl_code() + `
        void main(){
            float scalar = sin(18.01 * distance(point_position.xyz, center.xyz));
            gl_FragColor = scalar * vec4(0.6078, 0.3961, 0.098, 1.0);
        }`;
    }
}
