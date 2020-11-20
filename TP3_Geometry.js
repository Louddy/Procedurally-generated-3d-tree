
class Node {
	constructor (parentNode) {
		this.parentNode = parentNode; //Noeud parent
		this.childNode = []; //Noeud enfants
		
		this.p0 = null; //Position de depart de la branche
		this.p1 = null; //Position finale de la branche
		
		this.a0 = null; //Rayon de la branche a p0
		this.a1 = null; //Rayon de la branche a p1
		
		this.sections = null; //Liste contenant une liste de points representant les segments circulaires du cylindre generalise
	}
}

TP3.Geometry = {
	
	generateSkeleton: function (str, theta, alpha, decay) {
		//console.log(str);

		let turtle = new THREE.Matrix4();
		var stack = [];
		var translate = new THREE.Matrix4();


		const split = str.split("");

		var currentNode = null;
		var rootNode = null;
		var parent = null;

		for (i = 0; i < split.length; i++) {
			//console.log(split[i]);
			//console.log(turtle);
			if ((/[A-Z]/).test(split[i])) {
				if (currentNode == null) {
					currentNode = new Node();
					currentNode.p0 = new THREE.Vector3(0,0,0);
					currentNode.a0 = alpha;
					rootNode = currentNode;
				} else {
					parent = currentNode;
					currentNode = new Node(parent);
					parent.childNode.push(currentNode);

					currentNode.p0 =  parent.p1;

					currentNode.a0 =  parent.a1;
				}
				//translate = new THREE.Matrix4().makeTranslation(0, 1, 0);
				//console.log(translate);
				//turtle = turtle.multiply(translate);
				//console.log(translate);

				let vec = new THREE.Vector3(0,alpha,0);
				currentNode.p1 = (vec.applyMatrix4(turtle)).add(currentNode.p0);
				currentNode.a1 = currentNode.a0 * decay;
				//console.log(currentNode.p1);
			} else if (split[i] == '[') {
				stack.push(currentNode);
				stack.push(turtle.clone());
			} else if (split[i] == ']') {
				turtle.copy(stack.pop());
				currentNode = stack.pop();
			} else if (split[i] == '+') {
				let rotate = new THREE.Matrix4();
				rotate.identity();
				rotate.makeRotationX(-theta);
				turtle.multiply(rotate);
			} else if (split[i] == '-') {
				let rotate = new THREE.Matrix4();
				rotate.identity();
				rotate.makeRotationX(theta);
				turtle.multiply(rotate);
			} else if (split[i] == '/') {
				let rotate = new THREE.Matrix4();
				rotate.identity();
				rotate.makeRotationY(-theta);
				turtle.multiply(rotate);
			} else if (split[i] == '\\') {
				let rotate = new THREE.Matrix4();
				rotate.identity();
				rotate.makeRotationY(theta);
				turtle.multiply(rotate);
			} else if (split[i] == '^') {
				let rotate = new THREE.Matrix4();
				rotate.identity();
				rotate.makeRotationZ(-theta);
				turtle.multiply(rotate);
			} else if (split[i] == '\_') {
				let rotate = new THREE.Matrix4();
				rotate.identity();
				rotate.makeRotationZ(theta);
				turtle.multiply(rotate);
			}
			//console.log(turtle);
		}
		return rootNode;
	},
	
	simplifySkeleton: function (rootNode, rotationThreshold = 0.0001) {
		//TODO
	},
	
	generateSegmentsHermite: function (rootNode, lengthDivisions = 4, radialDivisions = 8) {
		//TODO
	},
	
	hermite: function (h0, h1, v0, v1, t) {
		//TODO
	},
	
	// Trouver l'axe et l'angle de rotation entre deux vecteurs
	findRotation: function (a, b) {
		const axis = new THREE.Vector3().crossVectors(a, b).normalize();
		var c = a.dot(b)/(a.length() * b.length());
		
		if (c < -1) {
			c = -1;
		} else if (c > 1) {
			c = 1;
		}
		
		const angle = Math.acos(c);
		
		return [axis, angle];
	},
	
	// Projeter un vecter a sur b
	project: function (a, b) {
		return b.clone().multiplyScalar(a.dot(b) / (b.lengthSq()));
	},
	
	// Trouver le vecteur moyen d'une liste de vecteurs
	meanPoint: function (points) {
		var mp = new THREE.Vector3();
		
		for (var i=0; i<points.length; i++) {
			mp.add(points[i]);
		}
		
		return mp.divideScalar(points.length);
	}

};