
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
		// console.log(str);
		//
		// var turtle = new THREE.Matrix4();
		// console.log(turtle);
		//
		// const vec = new THREE.Vector3(0, 1, 0);
		//
		// var stack = [];
		//
		// var rotate = new THREE.Matrix4();
		// const translate = new THREE.Matrix4();
		// translate.makeTranslation(0, 1, 0);
		//
		// const split = str.split("");
		//
		// var currentNode = null;
		// var rootNode = null;
		//
		// for (i = 0; i < split.length; i++) {
		// 	console.log(split[i]);
		// 	console.log(turtle);
		// 	if ((/[A-Z]/).test(split[i])) {
		// 		if (currentNode == null) {
		// 			currentNode = new Node();
		// 			currentNode.p0 = new THREE.Vector3();
		//
		// 			currentNode.a0 = alpha;
		// 		} else {
		// 			var parent = currentNode;
		// 			currentNode = new Node(parent);
		// 			parent.childNode.push(currentNode);
		//
		// 			currentNode.p0 = vec.applyMatrix4(turtle);
		//
		// 			currentNode.a0 = parent.a1;
		// 		}
		// 		turtle = turtle.multiply(translate);
		//
		// 		currentNode.p1 = vec.applyMatrix4(turtle);
		//
		// 		currentNode.a1 = currentNode.a0 * decay;
		//
		// 		if (rootNode == null) {
		// 			rootNode = currentNode;
		// 		}
		//
		// 		console.log(currentNode.p1);
		// 	} else if (split[i] == '[') {
		// 		stack.push(currentNode);
		// 		stack.push(turtle);
		// 	} else if (split[i] == ']') {
		// 		turtle = stack.pop();
		// 		currentNode = stack.pop();
		// 	} else if (split[i] == '+') {
		// 		rotate.makeRotationX(theta);
		// 		turtle.multiply(rotate);
		// 	} else if (split[i] == '-') {
		// 		rotate.makeRotationX(-theta);
		// 		turtle.multiply(rotate);
		// 	} else if (split[i] == '/') {
		// 		rotate.makeRotationY(theta);
		// 		turtle.multiply(rotate);
		// 	} else if (split[i] == '\\') {
		// 		rotate.makeRotationY(-theta);
		// 		turtle.multiply(rotate);
		// 	} else if (split[i] == '^') {
		// 		rotate.makeRotationZ(theta);
		// 		turtle.multiply(rotate);
		// 	} else if (split[i] == '\_') {
		// 		rotate.makeRotationZ(-theta);
		// 		turtle.multiply(rotate);
		// 	}
		// 	console.log(turtle);
		// }
		// return rootNode;
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