class Matrix {
    constructor(r, c) {
        this.rows = r;
        this.columns = c;
        this.data = [];
        var i, j;
        for (i = 0; i < this.rows; i++) {
            this.data.push([]);
            for (j = 0; j < this.columns; j++) {
                this.data[i].push(0);
            }
        }
    }

    set values(v) {
        var i, j, idx;
        // v is already a 2d array with dims equal to rows and columns
        if (v instanceof Array && v.length === this.rows && 
            v[0] instanceof Array && v[0].length === this.columns) {
            this.data = v;
        }
        // v is a flat array with length equal to rows * columns
        else if (v instanceof Array && typeof v[0] === 'number' &&
                 v.length === this.rows * this.columns) {
            idx = 0;
            for (i = 0; i < this.rows; i++) {
                for (j = 0; j < this.columns; j++) {
                    this.data[i][j] = v[idx];
                    idx++;
                }
            }
        }
        // not valid
        else {
            console.log("could not set values for " + this.rows + "x" + this.columns + " maxtrix");
        }
    }

    get values() {
        return this.data.slice();
    }

    // matrix multiplication (this * rhs)
    mult(rhs) {
        var result = null;
        var i, j, k, vals, sum;
        // ensure multiplication is valid
        if (rhs instanceof Matrix && this.columns === rhs.rows) {
            result = new Matrix(this.rows, rhs.columns);
            vals = result.values;
            for (i = 0; i < result.rows; i++) {
                for (j = 0; j < result.columns; j++) {
                    sum = 0;
                    for (k = 0; k < this.columns; k++) {
                        sum += this.data[i][k] * rhs.data[k][j]
                    }
                    vals[i][j] = sum;
                }
            }
            result.values = vals;
        }
        else {
            console.log("could not multiply - row/column mismatch");
        }
        return result;
    }
}

Matrix.multiply = function(...args) {
    var i;
    var result = null;
    // ensure at least 2 matrices
    if (args.length >= 2 && args.every((item) => {return item instanceof Matrix;})) {
        result = args[0];
        i = 1;
        while (result !== null && i < args.length) {
            result = result.mult(args[i]);
            i++;
        }
        if (args[args.length - 1] instanceof Vector) {
            result = new Vector(result);
        }
    }
    else {
        console.log("could not multiply - requires at least 2 matrices");
    }
    return result;
}


class Vector extends Matrix {
    constructor(n) {
        var i;
        if (n instanceof Matrix) {
            super(n.rows, 1);
            for (i = 0; i < this.rows; i++) {
                this.data[i][0] = n.data[i][0];
            }
        }
        else {
            super(n, 1);
        }
    }

    get x() {
        var result = null;
        if (this.rows > 0) {
            result = this.data[0][0];
        }
        return result;
    }

    get y() {
        var result = null;
        if (this.rows > 1) {
            result = this.data[1][0];
        }
        return result;
    }

    get z() {
        var result = null;
        if (this.rows > 2) {
            result = this.data[2][0];
        }
        return result;
    }

    get w() {
        var result = null;
        if (this.rows > 3) {
            result = this.data[3][0];
        }
        return result;
    }

    set x(val) {
        if (this.rows > 0) {
            this.data[0][0] = val;
        }
    }

    set y(val) {
        if (this.rows > 0) {
            this.data[1][0] = val;
        }
    }

    set z(val) {
        if (this.rows > 0) {
            this.data[2][0] = val;
        }
    }

    set w(val) {
        if (this.rows > 0) {
            this.data[3][0] = val;
        }
    }

    magnitude() {
        var i;
        var sum = 0;
        for (i = 0; i < this.rows; i++) {
            sum += this.data[i][0] * this.data[i][0];
        }
        return Math.sqrt(sum);
    }

    normalize() {
        var i;
        var mag = this.magnitude();
        for (i = 0; i < this.rows; i++) {
            this.data[i][0] /= mag;
        }
    }

    scale(s) {
        var i;
        for (i = 0; i < this.rows; i++) {
            this.data[i][0] *= s;
        }
    }

    add(rhs) {
        var i;
        var result = null;
        if (rhs instanceof Vector && this.rows === rhs.rows) {
            result = new Vector(this.rows);
            for (i = 0; i < this.rows; i++) {
                result.data[i][0] = this.data[i][0] + rhs.data[i][0];
            }
        }
        return result;
    }

    subtract(rhs) {
        var i;
        var result = null;
        if (rhs instanceof Vector && this.rows === rhs.rows) {
            result = new Vector(this.rows);
            for (i = 0; i < this.rows; i++) {
                result.data[i][0] = this.data[i][0] - rhs.data[i][0];
            }
        }
        return result;
    }

    dot(rhs) {
        var i;
        var sum = 0;
        if (rhs instanceof Vector && this.rows === rhs.rows) {
            for (i = 0; i < this.rows; i++) {
                sum += this.data[i][0] * rhs.data[i][0];
            }
        }
        return sum;
    }

    cross(rhs) {
        var result = null;
        if (rhs instanceof Vector && this.rows === 3 && rhs.rows === 3) {
            result = new Vector(3);
            result.values = [this.data[1][0] * rhs.data[2][0] - this.data[2][0] * rhs.data[1][0],
                             this.data[2][0] * rhs.data[0][0] - this.data[0][0] * rhs.data[2][0],
                             this.data[0][0] * rhs.data[1][0] - this.data[1][0] * rhs.data[0][0]]
        }
        return result;
    }
}



function mat4x4identity() {
    var result = new Matrix(4, 4);
    var identity = [[1,0,0,0],
					[0,1,0,0],
					[0,0,1,0],
					[0,0,0,1]];
	result.values = identity;
    return result;
}

function mat4x4translate(tx, ty, tz) {
    var result = new Matrix(4, 4);
	var translate = [[1,0,0,tx],
					[0,1,0,ty],
					[0,0,1,tz],
					[0,0,0,1]];
	result.values = translate;
    return result;
}

function mat4x4scale(sx, sy, sz) {
    var result = new Matrix(4, 4);
	var scale = [[sx,0,0,0],
				[0,sy,0,0],
				[0,0,sz,0],
				[0,0,0,1]];
    result.values = scale;
    return result;
}

function mat4x4rotatex(theta) {
    var result = new Matrix(4, 4);
	var sTheta = Math.sin(theta * Math.PI/180.0);
	var cTheta = Math.cos(theta * Math.PI/180.0);
   	var rotatex = [[1,0,0,0],
		      	  [0,cTheta,-sTheta,0],
				  [0,sTheta,cTheta,0],
				  [0,0,0,1]];
    result.values = rotatex;
    return result;
}

function mat4x4rotatey(theta) {
    var result = new Matrix(4, 4);
	var sTheta = Math.sin(theta * Math.PI/180.0);
	var cTheta = Math.cos(theta * Math.PI/180.0);
   	var rotatey = [[cTheta,0,sTheta,0],
				  [0,1,0,0],
				  [-sTheta,0,cTheta,0],
				  [0,0,0,1]];
    result.values = rotatey;
    return result;
}

function mat4x4rotatez(theta) {
    var result = new Matrix(4, 4);
	var sTheta = Math.sin(theta * Math.PI/180.0);
	var cTheta = Math.cos(theta * Math.PI/180.0);
   	var rotatez = [[cTheta,-sTheta,0,0],
				  [sTheta,cTheta,0,0],
				  [0,0,1,0],
				  [0,0,0,1]];
    result.values = rotatez;
    return result;
}

function mat4x4shearxy(shx, shy) {
    var result = new Matrix(4, 4);
    var shear = [[1,0,shx,0],
				[0,1,shy,0],
				[0,0,1,0],
				[0,0,0,1]];
	result.values = shear;
    return result;
}

function mat4x4parallel(vrp, vpn, vup, prp, clip) {
    // 1. translate VRP to the origin
    // 2. rotate VRC such that n-axis (VPN) becomes the z-axis, 
    //    u-axis becomes the x-axis, and v-axis becomes the y-axis
    // 3. shear such that the DOP becomes parallel to the z-axis
    // 4. translate and scale into canonical view volume
    //    (x = [-1,1], y = [-1,1], z = [0,-1])
	
	var t_matrix = new Matrix(4,4);
	var r_matrix = new Matrix(4,4);
	var Shear_matrix = new Matrix(4,4);
	var Tpar_matrix = new Matrix(4,4);
	var Spar_matrix = new Matrix(4,4);
	var translate = [[1,0,0,-vrp.x],[0,1,0,-vrp.y],[0,0,1,-vrp.z],[0,0,0,1]];
	t_matrix.values = translate;
	
	var u_axis = vup.cross(vpn);
	var rotate = [[u_axis.x,u_axis.y,u_axis.z,0],[vup.x,vup.y,vup.z,0],[vpn.x,vpn.y,vpn.z,0],[0,0,0,1]];
	r_matrix.values = rotate;
	
	var cwx = (clip[0] + clip[1])/2; //clip is an array - (umin, umax, vmin, vmax, front, back)
	var cwy = (clip[2] + clip[3])/2;
	var dopx = cwx - prp.x;
	var dopy = cwy - prp.y;
	var dopz = 0 - prp.z;
	var shx = -dopx/dopz;
	var shy = -dopy/dopz;
	var shpar = [[1,0,shx,0],[0,1,shy,0],[0,0,1,0],[0,0,0,1]];
	Shear_matrix.values = shpar;
	
	var Tpar = [[1,0,0,-cwx],[0,1,0,-cwy],[0,0,1,-clip[4]],[0,0,0,1]];
	Tpar_matrix.values = Tpar;
	
	var Spar = [[2/(clip[1] - clip[0]),0,0,0],[0,2/(clip[3] - clip[2]),0,0],[0,0,1/(clip[4] - clip[5]),0],[0,0,0,1]];
	Spar_matrix.values = Spar;
	
	var Npar = Spar_matrix.mult(Tpar_matrix.mult(Shear_matrix.mult(r_matrix.mult(t_matrix))));
	return Npar;
}

function mat4x4perspective(vrp, vpn, vup, prp, clip) {
    // 1. translate VRP to the origin
    // 2. rotate VRC such that n-axis (VPN) becomes the z-axis, 
    //    u-axis becomes the x-axis, and v-axis becomes the y-axis
    // 3. translate PRP to the origin
    // 4. shear such that the center line of the view volume becomes the z-axis
    // 5. scale into canonical view volume (truncated pyramid)
    //    (x = [z,-z], y = [z,-z], z = [-z_min,-1])
	vpn.normalize();
	var n_axis = vpn;
	var u_axis = vup.cross(n_axis);
	u_axis.normalize();
	var v_axis = n_axis.cross(u_axis);
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
	
	var cwx = (clip[1] + clip[0])/2; //clip is an array - (umin, umax, vmin, vmax, front, back)
	var cwy = (clip[2] + clip[3])/2;
	var dopx = cwx - prp.x;
	var dopy = cwy - prp.y;
	var dopz = 0 - prp.z;
	var shx = -dopx/dopz;
	var shy = -dopy/dopz;
	
	var shpar = [[1,0,shx,0],[0,1,shy,0],[0,0,1,0],[0,0,0,1]];
	Shear_matrix.values = shpar;
	var sperx = 2*(-prp.z)/((clip[1] - clip[0])*(-prp.z + clip[5]));
	var spery = 2*(-prp.z)/((clip[3] - clip[2])*(-prp.z + clip[5]));
	var sperz = -1/(-prp.z + clip[5]);
	var sper = [[sperx,0,0,0],[0,spery,0,0],[0,0,sperz,0],[0,0,0,1]];
	Sper_matrix.values = sper;
	
	var Nper = Sper_matrix.mult(Shear_matrix.mult(t_prp_matrix.mult(r_matrix.mult(t_matrix))));
	return Nper;
}

function mat4x4mper(near) {
    // convert perspective canonical view volume into the parallel one
    var result = new Matrix(4, 4);
	result.values = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,1/near,0]];
    return result;
}

function Vector3(x, y, z) {
    var result = new Vector(3);
    result.values = [x, y, z];
    return result;
}

function Vector4(x, y, z, w) {
    var result = new Vector(4);
    result.values = [x, y, z, w];
    return result;
}
