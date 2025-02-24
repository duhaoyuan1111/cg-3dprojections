var view;
var ctx;
var scene;

// Initialization function - called when web page loads
function Init() {
    var w = 800;
    var h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    // initial scene... feel free to change this
    scene = {
        view: {
            type: 'perspective',
            vrp: Vector3(20, 0, -30),
            vpn: Vector3(1, 0, 1),
            vup: Vector3(0, 1, 0),
            prp: Vector3(14, 20, 26),
            clip: [-20, 20, -4, 36, 1, -50]
        },
        models: [
            {
                type: 'generic',
                vertices: [
                    Vector4( 0,  0, -30, 1),
                    Vector4(20,  0, -30, 1),
                    Vector4(20, 12, -30, 1),
                    Vector4(10, 20, -30, 1),
                    Vector4( 0, 12, -30, 1),
                    Vector4( 0,  0, -60, 1),
                    Vector4(20,  0, -60, 1),
                    Vector4(20, 12, -60, 1),
                    Vector4(10, 20, -60, 1),
                    Vector4( 0, 12, -60, 1)
                ],
                edges: [
                    [0, 1, 2, 3, 4, 0],
                    [5, 6, 7, 8, 9, 5],
                    [0, 5],
                    [1, 6],
                    [2, 7],
                    [3, 8],
                    [4, 9]
                ]
            }
        ]
    };

    calculateCenter();

    // event handler for pressing arrow keys
    document.addEventListener('keydown', OnKeyDown, false);

    DrawScene();
}

function calculateCenter(){
    var xmin, xmax, ymin, ymax, zmin, zmax;
    for (let j = 0; j < scene.models.length; j++) { // each model do things below
        xmin = scene.models[j].vertices[0].x;
        xmax = scene.models[j].vertices[0].x;
        ymin = scene.models[j].vertices[0].y;
        ymax = scene.models[j].vertices[0].y;
        zmin = scene.models[j].vertices[0].z;
        zmax = scene.models[j].vertices[0].z;

        for (let i = 1; i < scene.models[j].vertices.length; i++) {
            if(scene.models[j].vertices[i].x < xmin) xmin = scene.models[j].vertices[i].x;
            if(scene.models[j].vertices[i].x > xmax) xmax = scene.models[j].vertices[i].x;
            if(scene.models[j].vertices[i].y < ymin) ymin = scene.models[j].vertices[i].y;
            if(scene.models[j].vertices[i].y > ymax) ymax = scene.models[j].vertices[i].y;
            if(scene.models[j].vertices[i].z < zmin) zmin = scene.models[j].vertices[i].z;
            if(scene.models[j].vertices[i].z > zmax) zmax = scene.models[j].vertices[i].z;
        }

        scene.models[j].middle = Vector4((xmin+xmax)/2, (ymin+ymax)/2, (zmin+zmax)/2, 1);
        scene.models[j].transform = mat4x4identity();
    }

}

// Main drawing code here! Use information contained in variable `scene`
function DrawScene() {
    //clears canvas for redraw
    ctx.clearRect(0,0, view.width, view.height);
	var v_matrix = new Matrix(4,4);
	v_matrix.values = [[view.width/2, 0, 0, view.width/2],[0, view.height/2, 0, view.height/2],[0,0,1,0],[0,0,0,1]];
	if (scene.view.type === 'perspective') {
		var beforeDrawLine = [];
		var beforeClipping = [];
		var clipVertices = [];
		var Nper = mat4x4perspective(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
		var Mper = mat4x4mper(-1);

		for (let j = 0; j < scene.models.length; j++) { // each model do things below
			for (let i = 0; i < scene.models[j].vertices.length; i++) {

				beforeClipping[i] = Matrix.multiply(Nper, scene.models[j].transform, scene.models[j].vertices[i]);

			}
			for (let m = 0; m < scene.models[j].edges.length; m++) { // Clipping all Vertices
				for (let n = 0; n < scene.models[j].edges[m].length-1; n++) {
					var ans = clipping(beforeClipping[scene.models[j].edges[m][n]],beforeClipping[scene.models[j].edges[m][n+1]],scene.view);
					if (ans !== null) {
						clipVertices.push(ans[0]);
						clipVertices.push(ans[1]);
					}
				}
			}
			for (let k = 0; k < clipVertices.length; k++) { // mult v_matrix
				beforeDrawLine[k] = Matrix.multiply(v_matrix, Mper, clipVertices[k]);
				let v_x = beforeDrawLine[k].x;
				let v_y = beforeDrawLine[k].y;
				let v_z = beforeDrawLine[k].z;
				let v_w = beforeDrawLine[k].w;
				beforeDrawLine[k] = Vector4(v_x/v_w, v_y/v_w, v_z/v_w, v_w/v_w);
			}
			for (let p = 0; p < beforeDrawLine.length; p+=2) { // draw lines
				DrawLine(beforeDrawLine[p].x, beforeDrawLine[p].y, beforeDrawLine[p+1].x, beforeDrawLine[p+1].y);
			}
		}
	} else { // scene.view.type === 'parallel'
		var beforeDrawLine = [];
		var beforeClipping = [];
		var clipVertices = [];
		var Npar = mat4x4parallel(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
		var Mpar = new Matrix(4,4);
		Mpar.values = [[1,0,0,0],[0,1,0,0],[0,0,0,0],[0,0,0,1]];
		for (let j = 0; j < scene.models.length; j++) { // each model do things below
			for (let i = 0; i < scene.models[j].vertices.length; i++) {
				beforeClipping[i] = Matrix.multiply(Npar, scene.models[j].transform, scene.models[j].vertices[i]);
			}
			for (let m = 0; m < scene.models[j].edges.length; m++) { // Clipping all Vertices
				for (let n = 0; n < scene.models[j].edges[m].length-1; n++) {
					var ans = clipping(beforeClipping[scene.models[j].edges[m][n]],beforeClipping[scene.models[j].edges[m][n+1]],scene.view);
					if (ans !== null) {
						clipVertices.push(ans[0]);
						clipVertices.push(ans[1]);
					}
				}
			}
			for (let k = 0; k < clipVertices.length; k++) { // mult v_matrix
				beforeDrawLine[k] = Matrix.multiply(v_matrix, Mpar, clipVertices[k]);
				let v_x = beforeDrawLine[k].x;
				let v_y = beforeDrawLine[k].y;
				let v_z = beforeDrawLine[k].z;
				let v_w = beforeDrawLine[k].w;
				beforeDrawLine[k] = Vector4(v_x/v_w, v_y/v_w, v_z/v_w, v_w/v_w);
			}
			for (let p = 0; p < beforeDrawLine.length; p+=2) { // draw lines
				DrawLine(beforeDrawLine[p].x, beforeDrawLine[p].y, beforeDrawLine[p+1].x, beforeDrawLine[p+1].y);
			}
		}
	}
}

function GetOutcode(Vector4,view){
	var x = Vector4.x;
	var y = Vector4.y;
	var z = Vector4.z;
	var zmin = -(-z+view.clip[4])/(-z+view.clip[5]);
	var code = 0;
	if(view.type==='perspective'){
		if(x<z) {
			code += 32;
		} else if(x>-z) {
			code += 16;
		} else {
			code += 0;
		}

		if(y<z) {
			code += 8;
		} else if(y>-z) {
			code += 4;
		} else {
			code +=0;
		}

		if(z>zmin) {
			code += 2;
		} else if(z<-1) {
			code += 1;
		} else {
			code += 0;
		}
	} else { //parallel
		if(x<-1) {
			code += 32;
		} else if(x>1) {
			code += 16;
		} else {
			code += 0;
		}

		if(y<-1) {
			code += 8;
		} else if(y>1) {
			code += 4;
		} else {
			code +=0;
		}

		if(z>0) {
			code += 2;
		} else if(z<-1) {
			code += 1;
		} else {
			code += 0;
		}
	}
	return code;
}
function clipping(pt0,pt1,view){
	// Create a brand new copy for the pt0 and pt1 is necessary.
	var left = 32;
	var right = 16;
	var bottom = 8;
	var top = 4;
	var front = 2;
	var back = 1;
	var result = [];
	var tempPt0 = Vector4(pt0.x,pt0.y,pt0.z,1);
	var tempPt1 = Vector4(pt1.x,pt1.y,pt1.z,1);
	var zmin = -(-view.prp.z+view.clip[4])/(-view.prp.z+view.clip[5]);
	var codeA = GetOutcode(tempPt0,view);
	var codeB = GetOutcode(tempPt1,view);
	var deltax = pt1.x-pt0.x;
	var deltay = pt1.y-pt0.y;
	var deltaz = pt1.z-pt0.z;
	var done = false;
	var t;
	while(!done){
		var OR = (codeA | codeB);
		var And = (codeA & codeB);
		if(OR == 0){
			done = true;
			result[0] = tempPt0;
			result[1] = tempPt1;
			return result;
		} else if(And != 0) {
			done = true;
			return null;
		} else {
			var select_pt;
			var select_code;
			if(codeA > 0) {
				select_pt = tempPt0;
				select_code = codeA;
			} else {
				select_pt = tempPt1;
				select_code = codeB;
			}
			if((select_code & left) === left){
				if (view.type === 'perspective') {
					t = (-select_pt.x+select_pt.z)/(deltax-deltaz);
				} else {
					t = (-select_pt.x-1)/(deltax);
				}
				select_pt.x = select_pt.x+t*deltax;
				select_pt.y = select_pt.y+t*deltay;
				select_pt.z = select_pt.z+t*deltaz;
			}else if ((select_code & right) === right){
				if (view.type === 'perspective') {
					t = (select_pt.x+select_pt.z)/(-deltax-deltaz);
				} else {
					t = (1-select_pt.x)/(deltax);
				}
				select_pt.x = select_pt.x+t*deltax;
				select_pt.y = select_pt.y+t*deltay;
				select_pt.z = select_pt.z+t*deltaz;
			}else if ((select_code & bottom) === bottom){
				if (view.type === 'perspective') {
					t = (-select_pt.y+select_pt.z)/(deltay-deltaz);
				} else {
					t = (-select_pt.y-1)/(deltay);
				}
				select_pt.x = select_pt.x+t*deltax;
				select_pt.y = select_pt.y+t*deltay;
				select_pt.z = select_pt.z+t*deltaz;
			}else if ((select_code & top) === top){
				if (view.type === 'perspective') {
					t = (select_pt.y+select_pt.z)/(-deltay-deltaz);
				} else {
					t = (1-select_pt.y)/(deltay);
				}
				select_pt.x = select_pt.x+t*deltax;
				select_pt.y = select_pt.y+t*deltay;
				select_pt.z = select_pt.z+t*deltaz;
			}else if ((select_code & front) === front){
				if (view.type === 'perspective') {
					t = (select_pt.z-zmin)/(-deltaz);
				} else {
					t = (-select_pt.z)/(deltaz);
				}
				select_pt.x = select_pt.x+t*deltax;
				select_pt.y = select_pt.y+t*deltay;
				select_pt.z = select_pt.z+t*deltaz;
			}else if ((select_code & back) === back){
				if (view.type === 'perspective') {
					t = (-select_pt.z-1)/(deltaz);
				} else {
					t = (-1-select_pt.z)/(deltaz);
				}
				select_pt.x = select_pt.x+t*deltax;
				select_pt.y = select_pt.y+t*deltay;
				select_pt.z = select_pt.z+t*deltaz;
			}
			select_code = GetOutcode(select_pt,view);
			if(codeA > 0){
				codeA = select_code;
			}else{
				codeB = select_code;
			}
		}
	}
	return result;
}

// Called when user selects a new scene JSON file
function LoadNewScene() {
    var scene_file = document.getElementById('scene_file');

//    console.log(scene_file.files[0]);

    var reader = new FileReader();
    reader.onload = (event) => {
        scene = JSON.parse(event.target.result);
        scene.view.vrp = Vector3(scene.view.vrp[0], scene.view.vrp[1], scene.view.vrp[2]);
        scene.view.vpn = Vector3(scene.view.vpn[0], scene.view.vpn[1], scene.view.vpn[2]);
        scene.view.vup = Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]);
        scene.view.prp = Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]);

        for (let i = 0; i < scene.models.length; i++) {
            if (scene.models[i].type === 'generic') {
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    scene.models[i].vertices[j] = Vector4(scene.models[i].vertices[j][0],
                                                          scene.models[i].vertices[j][1],
                                                          scene.models[i].vertices[j][2],
                                                          1);
                }
            } else if (scene.models[i].type === 'cube') {
				var width = scene.models[i].width;
				var height = scene.models[i].height;
				var depth = scene.models[i].depth;
				var center = scene.models[i].center;
				// vertices
				var v0 = Vector4(scene.models[i].center[0]-width/2, scene.models[i].center[1]-height/2, scene.models[i].center[2]+depth/2,1);
				var v1 = Vector4(scene.models[i].center[0]+width/2, scene.models[i].center[1]-height/2, scene.models[i].center[2]+depth/2,1);
				var v2 = Vector4(scene.models[i].center[0]+width/2, scene.models[i].center[1]+height/2, scene.models[i].center[2]+depth/2,1);
				var v3 = Vector4(scene.models[i].center[0]-width/2, scene.models[i].center[1]+height/2, scene.models[i].center[2]+depth/2,1);
				var v4 = Vector4(scene.models[i].center[0]-width/2, scene.models[i].center[1]-height/2, scene.models[i].center[2]-depth/2,1);
				var v5 = Vector4(scene.models[i].center[0]+width/2, scene.models[i].center[1]-height/2, scene.models[i].center[2]-depth/2,1);
				var v6 = Vector4(scene.models[i].center[0]+width/2, scene.models[i].center[1]+height/2, scene.models[i].center[2]-depth/2,1);
				var v7 = Vector4(scene.models[i].center[0]-width/2, scene.models[i].center[1]+height/2, scene.models[i].center[2]-depth/2,1);
				scene.models[i].vertices = [v0,v1,v2,v3,v4,v5,v6,v7];
				// edges
				scene.models[i].edges = [[0,1,2,3,0],[4,5,6,7,4],[0,4],[1,5],[2,6],[3,7]];
			} else if (scene.models[i].type === 'cylinder'){
				var radius = scene.models[i].radius;
				var height = scene.models[i].height;
				var center = scene.models[i].center;
				var sides = scene.models[i].sides;
				var rotate = mat4x4rotatey(360/sides);
				// vertices
				scene.models[i].vertices = [];
				for(let j = 0; j<sides; j++) {
					scene.models[i].vertices.push(Vector4(center[0]+radius*Math.cos(j*2*Math.PI/sides),center[1]-height/2,center[2]-radius*Math.sin(j*2*Math.PI/sides),1));
				}
				for(let k = 0; k<sides; k++) {
					scene.models[i].vertices.push(Vector4(center[0]+radius*Math.cos(k*2*Math.PI/sides),center[1]+height/2,center[2]-radius*Math.sin(k*2*Math.PI/sides),1));
				}
				// edges
				scene.models[i].edges = [];
				for(let j = 0; j<((scene.models[i].vertices.length)/2)+2; j++) {
					scene.models[i].edges[j] = [];
				}
				for(let j = 0; j<(scene.models[i].vertices.length)/2; j++) {
					scene.models[i].edges[0][j] = j;
				}
				scene.models[i].edges[0][(scene.models[i].vertices.length)/2] = scene.models[i].edges[0][0];
				for(let j = (scene.models[i].vertices.length)/2; j<(scene.models[i].vertices.length); j++) {
					scene.models[i].edges[1][j-(scene.models[i].vertices.length)/2] = j;
				}
				scene.models[i].edges[1][(scene.models[i].vertices.length)/2] = scene.models[i].edges[1][0];
				for (let j = 0; j < scene.models[i].edges[0].length-1; j++) {
					scene.models[i].edges[2+j] = [scene.models[i].edges[0][j],scene.models[i].edges[1][j]];
				}
			} else if (scene.models[i].type === 'cone') {
				var radius = scene.models[i].radius;
				var height = scene.models[i].height;
				var center = scene.models[i].center;
				var sides = scene.models[i].sides;
				var rotate = mat4x4rotatey(360/sides);
				// vertices
				scene.models[i].vertices = [];
				for(let j = 0; j<sides; j++) {
					scene.models[i].vertices.push(Vector4(center[0]+radius*Math.cos(j*2*Math.PI/sides),center[1]-height/2,center[2]-radius*Math.sin(j*2*Math.PI/sides),1));
				}
				var v_Top = Vector4(center[0],center[1]+height/2,center[2],1);
				scene.models[i].vertices[sides] = v_Top;
				// edges
				scene.models[i].edges = [];
				for(let j= 0; j<scene.models[i].vertices.length; j++) {
					scene.models[i].edges[j] = [];
				}
				for(let j= 0; j<(scene.models[i].vertices.length)-1; j++) {
					scene.models[i].edges[0][j] = j;
				}
				scene.models[i].edges[0][scene.models[i].vertices.length-1] = scene.models[i].edges[0][0];
				scene.models[i].edges[1][0] = scene.models[i].vertices.length-1;
				scene.models[i].edges[1][1] = scene.models[i].vertices.length-1; // [6,6] is a one pixel line
				for (let j = 0; j < scene.models[i].edges[0].length-1; j++) {
					scene.models[i].edges[2+j] = [scene.models[i].edges[0][j],scene.models[i].edges[1][0]];
				}
			} else if (scene.models[i].type === 'sphere') {
				var slices = scene.models[i].slices;
				var stacks = scene.models[i].stacks;
				var center = scene.models[i].center;
				var radius = scene.models[i].radius;
				// vertices
				scene.models[i].vertices = [];
				for (let k = 0; k < stacks+1; k++) {
					for (let j = 0; j < slices; j++) {
						scene.models[i].vertices.push(Vector4(center[0]+radius*Math.sin(k*Math.PI/(stacks))*Math.cos(j*2*Math.PI/slices),
															  center[1]+radius*Math.cos(k*Math.PI/(stacks)),
															  center[2]+radius*Math.sin(k*Math.PI/(stacks))*Math.sin(j*2*Math.PI/slices),
															  1));
					}
				}
	//			console.log(scene.models[i].vertices);
				// edges
				scene.models[i].edges = [];
				for (let m = 0; m < slices+stacks+1; m++) {
					scene.models[i].edges[m] = [];
				}
				var count = 0;
				for (let n = 0; n < stacks+1; n++) {
					for (let m = 0; m < slices; m++) {
						scene.models[i].edges[m][n] = count;
						count++;
					}
				}
				var counter = 0;
				for (let j = slices; j < slices+stacks+1; j++) {
					for (let n = 0; n < slices; n++) {
						scene.models[i].edges[j][n] = counter;
						counter++;
					}
					scene.models[i].edges[j][slices] = scene.models[i].edges[j][0];
				}
			} else {
				scene.models[i].center = Vector4(scene.models[i].center[0],
                                                 scene.models[i].center[1],
                                                 scene.models[i].center[2],
                                                 1);
            }
        }
        calculateCenter();
        DrawScene();
    };
    reader.readAsText(scene_file.files[0], "UTF-8");
}

// Called when user presses a key on the keyboard down
function OnKeyDown(event) {
    switch (event.keyCode) {
        case 37: // LEFT Arrow translate the VRP along the u-axis
            //console.log("left");
            scene.view.vpn.normalize();
            var u_axis = scene.view.vup.cross(scene.view.vpn);
			u_axis.normalize();
            scene.view.vrp = scene.view.vrp.subtract(u_axis);
            DrawScene();
            break;

        case 38: // UP Arrow translate vrp along n-axis
            //console.log("up");
            scene.view.vpn.normalize();
            scene.view.vrp = scene.view.vrp.subtract(scene.view.vpn);
            DrawScene();
            break;

        case 39: // RIGHT  translate the VRP along the u-axis
            //console.log("right");
            scene.view.vpn.normalize();
            var u_axis = scene.view.vup.cross(scene.view.vpn);
			u_axis.normalize();
            scene.view.vrp = scene.view.vrp.add(u_axis);
            DrawScene();

            break;
        case 40: // DOWN Arrow translate vrp along n-axis
        //    console.log("down");
            scene.view.vpn.normalize();
            scene.view.vrp = scene.view.vrp.add(scene.view.vpn)
            DrawScene();
            break;
    }
}

//----ANIMATION-----
var start_time;
var prev_time;

function Animate(timestamp) {
    // step 1: calculate time (time since start) and/or delta time (time between successive frames)
    // step 2: transform models based on time or delta time
    // step 3: draw scene
    // step 4: request next animation frame (recursively calling same function)

    var time = timestamp - start_time;
    var dt = timestamp - prev_time;
    prev_time = timestamp;

    // ... step 2


    for (let j = 0; j < scene.models.length; j++) { // each model do things below
        //console.log("animate", j);
        var translateCenter = mat4x4translate(-scene.models[j].middle.x, -scene.models[j].middle.y, -scene.models[j].middle.z);
        var rotation
        if(scene.models[j].hasOwnProperty("animation")){
//            console.log("animate", j);
            if(scene.models[j].animation.axis == "x") rotation = mat4x4rotatex(((scene.models[j].animation.rps*360)*(time/1000)));
            else if(scene.models[j].animation.axis == "y") rotation = mat4x4rotatey(((scene.models[j].animation.rps*360)*(time/1000)));
            else rotation = mat4x4rotatez(((scene.models[j].animation.rps*360)*(time/1000)));

        }
        else{
            rotation = mat4x4identity();
        }

        var translateBack = mat4x4translate(scene.models[j].middle.x, scene.models[j].middle.y, scene.models[j].middle.z);
        var modelTransform = Matrix.multiply(translateBack, rotation, translateCenter);
        scene.models[j].transform = modelTransform;

    }

    DrawScene();

    window.requestAnimationFrame(Animate);
}

start_time = performance.now(); // current timestamp in milliseconds
prev_time = start_time;
window.requestAnimationFrame(Animate);



// Draw black 2D line with red endpoints
function DrawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
}
