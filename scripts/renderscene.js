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







	//var zmin = -(-z+scene.view.clip[4])/(-z+scene.view.clip[5]);
	if (scene.view.type === 'perspective') {
		var vector_Array = [];
		var matrix_Array = [];
		var Nper = mat4x4perspective(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);

		var Mper = mat4x4mper(-1);
		for (let i = 0; i < scene.models[0].vertices.length; i++) {

			matrix_Array[i] = v_matrix.mult(Mper.mult(Nper.mult(scene.models[0].vertices[i])));
		}





		for (let j = 0; j < matrix_Array.length; j++) {
			var v_x = matrix_Array[j].values[0][0];
			var v_y = matrix_Array[j].values[1][0];
			var v_z = matrix_Array[j].values[2][0];
			var v_w = matrix_Array[j].values[3][0];
			var vectorAfterMper = Vector3(v_x/v_w, v_y/v_w, v_z/v_w);
			vector_Array[j] = vectorAfterMper;
		}

		for (let k = 0; k < scene.models.length; k++) {
			for (let m = 0; m < scene.models[k].edges.length; m++) {
				for (let n = 0; n < scene.models[k].edges[m].length-1; n++) {
					DrawLine(vector_Array[scene.models[k].edges[m][n]].x, vector_Array[scene.models[k].edges[m][n]].y, vector_Array[scene.models[k].edges[m][n+1]].x, vector_Array[scene.models[k].edges[m][n+1]].y);
				}
			}
		}
	} else { // parallel
		var vector_Array = [];
		var matrix_Array = [];
		var Npar = mat4x4parallel(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);

		var Mpar = new Matrix(4,4);
		Mpar.values = [[1,0,0,0],[0,1,0,0],[0,0,0,0],[0,0,0,1]];
		for (let i = 0; i < scene.models[0].vertices.length; i++) {

			matrix_Array[i] = v_matrix.mult(Mpar.mult(Npar.mult(scene.models[0].vertices[i])));
		}





		for (let j = 0; j < matrix_Array.length; j++) {
			var v_x = matrix_Array[j].values[0][0];
			var v_y = matrix_Array[j].values[1][0];
			var v_z = matrix_Array[j].values[2][0];
			var v_w = matrix_Array[j].values[3][0];
	//		var vectorAfterMper = Vector4(v_x, v_y, v_z, v_w);
            var vectorAfterMper = Vector3(v_x/v_w, v_y/v_w, v_z/v_w);
            console.log(vectorAfterMper);
			vector_Array[j] = vectorAfterMper;
		}

		for (let k = 0; k < scene.models.length; k++) {
			for (let m = 0; m < scene.models[k].edges.length; m++) {
				for (let n = 0; n < scene.models[k].edges[m].length-1; n++) {
					DrawLine(vector_Array[scene.models[k].edges[m][n]].x, vector_Array[scene.models[k].edges[m][n]].y, vector_Array[scene.models[k].edges[m][n+1]].x, vector_Array[scene.models[k].edges[m][n+1]].y);
				}
			}
		}
	}

}

function GetOutcode(vertices,zmin){
	var x = vertices.x;
	var y = vertices.y;
	var z = vertices.z;
	//var zmin = -(-z+scene.view.clip[4])/(-z+scene.view.clip[5]);
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
	var pt0_array = [];
	var pt1_array = [];

	var zmin = -(-z+view.clip[4])/(-z+view.clip[5]);
	var codeA = GetOutcode(pt0,zmin);
	var codeB = GetOutcode(pt1,zmin);

	var deltax = pt1.x-pt0.x;
	var deltay = pt1.y-py0.y;
	var deltaz = pt1.z-py0.z;
	var done = false;
	while(!done){
		var OR = (codeA | codeB);
		var And = (codeA & codeB);

		if(OR == 0){
			done = true;
			result.pt0.x = pt0.x;
			result.pt0.y = pt0.y;
			result.pt0.z = pt0.z;
			result.pt1.x = pt1.x;
			result.pt1.y = pt1.y;
			result.pt1.z = pt1.z;

		}else if(And != 0){
			done = true;
			result = null;
		}else{
			var select_pt;
			var select_code;
			if(codeA>0){
				select_pt = pt0;
				select_code = codeA;
			}else{
				select_pt = pt1;
				select_code = codeB;
			}
			if((select_code & left) === left){
				let t = (-select_pt.x+select_pt.z)/(deltax-deltaz);
				select_pt.x = select_pt.x+t*deltax;
				select_pt.y = select_pt.y+t*deltay;
				select_pt.z = select_pt.z+t*deltaz;
			}else if ((select_code & right) === right){
				let t = (select_pt.x+select_pt.z)/(-deltax-deltaz);
				select_pt.x = select_pt.x+t*deltax;
				select_pt.y = select_pt.y+t*deltay;
				select_pt.z = select_pt.z+t*deltaz;
			}else if ((select_code & bottom) === bottom){
				let t = (-select_pt.y+select_pt.z)/(deltay-deltaz);
				select_pt.x = select_pt.x+t*deltax;
				select_pt.y = select_pt.y+t*deltay;
				select_pt.z = select_pt.z+t*deltaz;
			}else if ((select_code & top) === top){
				let t = (select_pt.y+select_pt.z)/(-deltay-deltaz);
				select_pt.x = select_pt.x+t*deltax;
				select_pt.y = select_pt.y+t*deltay;
				select_pt.z = select_pt.z+t*deltaz;
			}else if ((select_code & near) === near){
				let t = (select_pt.z-zmin)/(-deltaz);
				select_pt.x = select_pt.x+t*deltax;
				select_pt.y = select_pt.y+t*deltay;
				select_pt.z = select_pt.z+t*deltaz;
			}else if ((select_code & far) === far){
				let t = (-select_pt.z-1)/(deltaz);
				select_pt.x = select_pt.x+t*deltax;
				select_pt.y = select_pt.y+t*deltay;
				select_pt.z = select_pt.z+t*deltaz;
			}
			select_code = GetOutcode(select_pt,view);
			if(codeA>0){
				codeA = select_code;
			}else{
				codeB = select_code;
			}
		}
	}
	var pt_0 = Vector4(pt0_array[0],pt0_array[1],pt0_array[2],1);
	var pt_1 = Vector4(pt1_array[0],pt1_array[1],pt1_array[2],1);
	var result = {pt_0,pt_1};
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






			}else {
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
        case 37: // LEFT Arrow rotate view-plane around v-axis with PRP as origin
            console.log("left");
            scene.view.vpn.normalize();
            var n_axis = scene.view.vpn;
            var u_axis = scene.view.vup.cross(n_axis);
            u_axis.normalize();
            var v_axis = n_axis.cross(u_axis);
            var addThisU = Vector3(u_axis.x, u_axis.y, u_axis.z);
            addThisU.scale(scene.view.prp.x);
            var addThisV = Vector3(v_axis.x, v_axis.y, v_axis.z);
            addThisV.scale(scene.view.prp.y);
            var addThisN = Vector3(n_axis.x, n_axis.y, n_axis.z);
            addThisN.scale(scene.view.prp.z);
            var vrpCopy = Vector3(scene.view.vrp.x, scene.view.vrp.y, scene.view.vrp.z);
            var prpWorld = vrpCopy.add(addThisU).add(addThisV).add(addThisN);
            console.log(prpWorld);



            break;
        case 38: // UP Arrow translate vrp along n-axis
            console.log("up");
            scene.view.vpn.normalize();
            scene.view.vrp = scene.view.vrp.subtract(scene.view.vpn);
            DrawScene();
            break;
        case 39: // RIGHT Arrow rotate view-plane around v-axis with PRP as origin
            console.log("right");
            scene.view.vpn.normalize();
            var n_axis = scene.view.vpn;
            var u_axis = scene.view.vup.cross(n_axis);
            u_axis.normalize();
            var v_axis = n_axis.cross(u_axis);

/* translate, rotate, translate prp for VPN, then rotate how much you rotate, then undo tranlate, rotate, translate prp
vrp rotate 

var t_matrix = new Matrix(4,4);
var r_matrix = new Matrix(4,4);
var t_prp_matrix = new Matrix(4,4);
var Shear_matrix = new Matrix(4,4);
var Sper_matrix = new Matrix(4,4);

var translate = [[1,0,0,-vrp.x],[0,1,0,-vrp.y],[0,0,1,-vrp.z],[0,0,0,1]];
t_matrix.values = translate;

var rotate = [[u_axis.x,u_axis.y,u_axis.z,0],[v_axis.x,v_axis.y,v_axis.z,0],[n_axis.x,n_axis.y,n_axis.z,0],[0,0,0,1]];
r_matrix.values = rotate;

var translateprp = [[1,0,0,-prp.x],[0,1,0,-prp.y],[0,0,1,-prp.z],[0,0,0,1]];
t_prp_matrix.values = translateprp;

*/


/*            var addThisU = Vector3(u_axis.x, u_axis.y, u_axis.z);
            addThisU.scale(scene.view.prp.x);
            var addThisV = Vector3(v_axis.x, v_axis.y, v_axis.z);
            addThisV.scale(scene.view.prp.y);
            var addThisN = Vector3(n_axis.x, n_axis.y, n_axis.z);
            addThisN.scale(scene.view.prp.z);
            var vrpCopy = Vector3(scene.view.vrp.x, scene.view.vrp.y, scene.view.vrp.z);
            var prpWorld = vrpCopy.add(addThisU).add(addThisV).add(addThisN);
            console.log(prpWorld);
            var translatePrpW = mat4x4translate(-prpWorld.x, -prpWorld.y, -prpWorld.z);
            var rotatePrpW = mat
*/

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
