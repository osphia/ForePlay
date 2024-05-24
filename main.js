import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

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
        };

        this.initial_camera_location = Mat4.look_at(vec3(0, -40, 50), vec3(0, 0, 0), vec3(0, 0, 1)); 
        
        
        this.ball_position = vec3(-10, 20, 1);  // Assuming these are the initial coordinates of the ball
        this.ball_velocity = vec3(0, 0, 0);     // Initialize with zero velocity
        this.ballRadius = 1;

        // Your other initializations...

        this.canvas = document.querySelector('#main-canvas');
        this.attach_event_listeners();
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("View golf course", ["Control", "0"], () => this.attached = () => null);
    }

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

            // Check if clicking on the ball
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
            this.ball_velocity = vec3(0, -30, 0); // Example: Roll to the right
        }
    }
    
    // isColliding() {
    //     for (let obstacle of this.obstacles) {
    //         if (this.ball_position[0] + this.ballRadius >= obstacle.minX && this.ball_position[0] - this.ballRadius <= obstacle.maxX &&
    //             this.ball_position[1] + this.ballRadius >= obstacle.minY && this.ball_position[1] - this.ballRadius <= obstacle.maxY &&
    //             this.ball_position[2] + this.ballRadius >= obstacle.minZ && this.ball_position[2] - this.ballRadius <= obstacle.maxZ) {
    //                 console.log("collide");
    //                 return obstacle;  // Returns the obstacle that was hit
    //         }
    //     }
    //     return null;
    // }
    
    updatePhysics(deltaTime) {
        // const obstacle = this.isColliding();
        // if (obstacle) {
        //     // Reflect the ball's velocity based on the obstacle's normal
        //     const N = obstacle.normal;
        //     const I = this.ball_velocity;
        //     const dotProduct = I.dot(N);
        //     const reflection = I.minus(N.times(2 * dotProduct));
        //     this.ball_velocity = reflection;
        // }

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
        }
    }
    //added fin    

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
        const deltaTime = program_state.animation_delta_time / 1000; // Convert ms to seconds
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