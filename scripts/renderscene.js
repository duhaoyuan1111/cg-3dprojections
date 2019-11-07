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

    // event handler for pressing arrow keys
    document.addEventListener('keydown', OnKeyDown, false);

    DrawScene();
}

// Main drawing code here! Use information contained in variable `scene`
function DrawScene() {
    //clears canvas for redraw
    ctx.clearRect(0,0, view.width, view.height);
	var v_matrix = new Matrix(4,4);
	v_matrix.values = [[view.width/2, 0, 0, view.width/2],[0, view.height/2, 0, view.height/2],[0,0,1,0],[0,0,0,1]];
	if (scene.view.type === 'perspective') {
		var vector_Array = [];
		var matrix_Array = [];
		var mega_Vector_Array = [];
		var tiny_Vector_Array = [];
		var beforeClipping = [];
		var clipVertices = [];
		var tiny_clipVertices = [];
		var mega_clipVertices = [];
		var Nper = mat4x4perspective(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
		var Mper = mat4x4mper(-1);
		for (let j = 0; j < scene.models.length; j++) {
			for (let i = 0; i < scene.models[j].vertices.length; i++) {
				beforeClipping[i] = Nper.mult(scene.models[j].vertices[i])
			}
			for (let m = 0; m < scene.models[j].edges.length; m++) {
				for (let n = 0; n < scene.models[j].edges[m].length-1; n++) {
					var ans = clipping(beforeClipping[scene.models[j].edges[m][n]],beforeClipping[scene.models[j].edges[m][n+1]],scene.view);
					if (ans != null) {
						tiny_clipVertices.push(ans[0]);
						tiny_clipVertices.push(ans[1]);
					}
				}
				clipVertices.push(tiny_clipVertices);
				tiny_clipVertices = [];
			}
			mega_clipVertices[j] = clipVertices;
			clipVertices = [];
		}
		for (let j = 0; j < scene.models.length; j++) {
			for (let i = 0; i < mega_clipVertices[j].length; i++) {
				for (let k = 0; k < mega_clipVertices[j][i].length; k++) {
					matrix_Array[k] = v_matrix.mult(Mper.mult(mega_clipVertices[j][i][k]));
					let v_x = matrix_Array[k].values[0][0];
					let v_y = matrix_Array[k].values[1][0];
					let v_z = matrix_Array[k].values[2][0];
					let v_w = matrix_Array[k].values[3][0];
					let vectorAfterMper = Vector4(v_x/v_w, v_y/v_w, v_z/v_w, v_w/v_w);
					tiny_Vector_Array.push(vectorAfterMper);
				}
				vector_Array.push(tiny_Vector_Array);
				tiny_Vector_Array = [];
			}
			mega_Vector_Array.push(vector_Array);
			vector_Array = [];
		}
		console.log(mega_Vector_Array);
		for (let k = 0; k < scene.models.length; k++) {
			for (let m = 0; m < mega_Vector_Array[k].length; m++) {
				for (let n = 0; n < mega_Vector_Array[k][m].length-1; n++) {
					DrawLine(mega_Vector_Array[k][m][n].x,
							mega_Vector_Array[k][m][n].y,
							mega_Vector_Array[k][m][n+1].x,
							mega_Vector_Array[k][m][n+1].y);
				}
			}
		}
	} else { // scene.view.type === 'parallel'
		var mega_Vector_Array = [];
		var vector_Array = [];
		var matrix_Array = [];
		var Npar = mat4x4parallel(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
		var Mpar = new Matrix(4,4);
		Mpar.values = [[1,0,0,0],[0,1,0,0],[0,0,0,0],[0,0,0,1]];
		for (let j = 0; j < scene.models.length; j++) {
			for (let i = 0; i < scene.models[j].vertices.length; i++) {
				matrix_Array[i] = v_matrix.mult(Mpar.mult(Npar.mult(scene.models[j].vertices[i])));
				let v_x = matrix_Array[i].values[0][0];
				let v_y = matrix_Array[i].values[1][0];
				let v_z = matrix_Array[i].values[2][0];
				let v_w = matrix_Array[i].values[3][0];
				let vectorAfterMpar = Vector4(v_x/v_w, v_y/v_w, v_z/v_w, v_w/v_w);
				vector_Array[i] = vectorAfterMpar;
			}
			mega_Vector_Array[j] = vector_Array;
			vector_Array = [];
		}
		for (let k = 0; k < scene.models.length; k++) {
			for (let m = 0; m < scene.models[k].edges.length; m++) {
				for (let n = 0; n < scene.models[k].edges[m].length-1; n++) {
					DrawLine(mega_Vector_Array[k][scene.models[k].edges[m][n]].x, mega_Vector_Array[k][scene.models[k].edges[m][n]].y, mega_Vector_Array[k][scene.models[k].edges[m][n+1]].x, mega_Vector_Array[k][scene.models[k].edges[m][n+1]].y);
				}
			}
		}
	}
}

function GetOutcode(vertices,zmin){
	var x = vertices[0];
	var y = vertices[1];
	var z = vertices[2];
	var code = 0;
	if(scene.view.type == "perspective") {
		if(x<z) {
			code += 32; //left
		} else if(x>-z) {
			code += 16; //right
		} else {
			code += 0;
		}

		if(y<z) {
			code += 8; //below
		} else if(y>-z) {
			code += 4; //above
		} else {
			code +=0;
		}

		if(z>zmin) {
			code += 2; //infront
		} else if(z<-1) {
			code += 1; //inback
		} else {
			code += 0;
		}
	} else { //parallel
		if(x<-1) {
			code += 32; //left
		} else if(x>1) {
			code += 16; //right
		} else {
			code += 0;
		}

		if(y<-1) {
			code += 8; //below
		} else if(y>1) {
			code += 4; //above
		} else {
			code +=0;
		}

		if(z>0) {
			code += 2; //infront
		} else if(z<-1) {
			code += 1; //inback
		} else {
			code += 0;
		}
	}
	return code;
}

function clipping(pt0,pt1,view){
	var left = 32;
	var right = 16;
	var bottom = 8;
	var top = 4;
	var near = 2;
	var far = 1;
	var result = [];
	var zmin = -(-view.prp.z+view.clip[4])/(-view.prp.z+view.clip[5]);
	var codeA = GetOutcode(pt0,zmin);
	var codeB = GetOutcode(pt1,zmin);
	var deltax = pt1[0]-pt0[0];
	var deltay = pt1[1]-pt0[1];
	var deltaz = pt1[2]-pt0[2];
	var done = false;
	while(!done){
		var OR = (codeA | codeB);
		var And = (codeA & codeB);
		if(OR == 0) {
			done = true;
			result[0] = pt0;
			result[1] = pt1;
			//console.log(result);
			return result;
		} else if(And != 0) {
			done = true;
			result = null;
		} else {
			var select_pt;
			var select_code;
			if(codeA>0) {
				select_pt = pt0;
				select_code = codeA;
			} else {
				select_pt = pt1;
				select_code = codeB;
			}

			if((select_code & left) === left) {
				let t = (-select_pt[0]+select_pt[2])/(deltax-deltaz);
				select_pt[0] = select_pt[0]+t*deltax;
				select_pt[1] = select_pt[1]+t*deltay;
				select_pt[2] = select_pt[2]+t*deltaz;
			} else if((select_code & right) === right) {
				let t = (select_pt[0]+select_pt[2])/(-deltax-deltaz);
				select_pt[0] = select_pt[0]+t*deltax;
				select_pt[1] = select_pt[1]+t*deltay;
				select_pt[2] = select_pt[2]+t*deltaz;
			} else if((select_code & bottom) === bottom) {
				let t = (-select_pt[1]+select_pt[2])/(deltay-deltaz);
				select_pt[0] = select_pt[0]+t*deltax;
				select_pt[1] = select_pt[1]+t*deltay;
				select_pt[2] = select_pt[2]+t*deltaz;
			} else if((select_code & top) === top) {
				let t = (select_pt[1]+select_pt[2])/(-deltay-deltaz);
				select_pt[0] = select_pt[0]+t*deltax;
				select_pt[1] = select_pt[1]+t*deltay;
				select_pt[2] = select_pt[2]+t*deltaz;
			} else if((select_code & near) === near) {
				let t = (select_pt[2]-zmin)/(-deltaz);
				select_pt[0] = select_pt[0]+t*deltax;
				select_pt[1] = select_pt[1]+t*deltay;
				select_pt[2] = select_pt[2]+t*deltaz;
			} else if((select_code & far) === far) {
				let t = (-select_pt[2]-1)/(deltaz);
				select_pt[0] = select_pt[0]+t*deltax;
				select_pt[1] = select_pt[1]+t*deltay;
				select_pt[2] = select_pt[2]+t*deltaz;
			}
			select_code = GetOutcode(select_pt,zmin);
			if(codeA>0) {
				codeA = select_code;
				pt0 = select_pt;
			} else {
				codeB = select_code;
				pt1 = select_pt;
			}
		}
	}
	return result;
}

// Called when user selects a new scene JSON file
function LoadNewScene() {
    var scene_file = document.getElementById('scene_file');

    console.log(scene_file.files[0]);

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
				var slices = scene.models[i].slices; //longitude jingdu
				var stacks = scene.models[i].stacks; //latitude  weidu
				var center = scene.models[i].center;
				var radius = scene.models[i].radius;
				// vertices
				scene.models[i].vertices = [];
				for (let k = 0; k < stacks+2; k++) {
					for (let j = 0; j < slices; j++) {
						scene.models[i].vertices.push(Vector4(center[0]+radius*Math.sin(k*Math.PI/(stacks+1))*Math.cos(j*2*Math.PI/slices),
															  center[1]+radius*Math.cos(k*Math.PI/(stacks+1)),
															  center[2]+radius*Math.sin(k*Math.PI/(stacks+1))*Math.sin(j*2*Math.PI/slices),
															  1));
					}
				}
				console.log(scene.models[i].vertices);
				// edges
				scene.models[i].edges = [];
				for (let m = 0; m < slices+stacks+2; m++) {
					scene.models[i].edges[m] = [];
				}
				var count = 0;
				for (let n = 0; n < stacks+2; n++) {
					for (let m = 0; m < slices; m++) {
						scene.models[i].edges[m][n] = count;
						count++;
					}
				}
				var counter = 0;
				for (let j = slices; j < slices+stacks+2; j++) {
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

        DrawScene();
    };
    reader.readAsText(scene_file.files[0], "UTF-8");
}

// Called when user presses a key on the keyboard down
function OnKeyDown(event) {
    switch (event.keyCode) {
        case 37: // LEFT Arrow translate the VRP along the u-axis
            console.log("left");
            scene.view.vpn.normalize();
            scene.view.vup.cross(scene.view.vpn).normalize();
            var v_axis = scene.view.vpn.cross(scene.view.vup);
            scene.view.vrp = scene.view.vrp.subtract(v_axis);
            DrawScene();
            break;

        case 38: // UP Arrow translate vrp along n-axis
            console.log("up");
            scene.view.vpn.normalize();
            scene.view.vrp = scene.view.vrp.subtract(scene.view.vpn);
            DrawScene();
            break;

        case 39: // RIGHT  translate the VRP along the u-axis
            console.log("right");
            scene.view.vpn.normalize();
            scene.view.vup.cross(scene.view.vpn).normalize();
            var v_axis = scene.view.vpn.cross(scene.view.vup);
            scene.view.vrp = scene.view.vrp.add(v_axis);
            DrawScene();

            break;
        case 40: // DOWN Arrow translate vrp along n-axis
            console.log("down");
            scene.view.vpn.normalize();
            scene.view.vrp = scene.view.vrp.add(scene.view.vpn)
            DrawScene();
            break;
    }
}

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
