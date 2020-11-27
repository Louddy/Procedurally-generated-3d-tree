
class Node {
	constructor (parentNode) {
		this.parentNode = parentNode; //Noeud parent
		this.childNode = []; //Noeud enfants
		
		this.p0 = null; //Position de depart de la branche
		this.p1 = null; //Position finale de la branche
		
		this.a0 = null; //Rayon de la branche a p0
		this.a1 = null; //Rayon de la branche a p1

		this.sections = []; //Liste contenant une liste de points representant les segments circulaires du cylindre generalise
		this.centre = [];
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

				let vec = new THREE.Vector3(0,alpha,0);
				currentNode.p1 = (vec.applyMatrix4(turtle)).add(currentNode.p0);
				currentNode.a1 = currentNode.a0 * decay;
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

		//return this.simplifySkeleton(rootNode, 0.0001,0);
		return rootNode;
	},
	
	simplifySkeleton: function (rootNode, rotationThreshold = 0.0001) {



		if (rootNode.childNode.length == 0) {
			return rootNode;
		}else if(rootNode.childNode.length == 1){
			let vect1 = (rootNode.p1.clone().sub(rootNode.p0)).normalize();
			let vect2 = (rootNode.childNode[0].p1.clone().sub(rootNode.childNode[0].p0)).normalize();
			//Ok ici je calc cos(theta), on pourrait la fonction this.findrotation
			cosangle = vect1.dot(vect2);
			if (cosangle>= 1){cosangle=1;}
			//if((Math.acos(vect1.dot(vect2))).isNaN()){console.log(vect1);}
			if (Math.acos(cosangle) <= rotationThreshold || Math.acos(vect1.dot(vect2)) >= rotationThreshold) {
				//console.log(rootNode);
				rootNode.p1 = rootNode.childNode[0].p1;
				rootNode.a1 = rootNode.childNode[0].a1;
				//rootNode.childNode[0].childNode[0].p0 =rootNode.p0;
				//rootNode.childNode[0].childNode[0].a0 =rootNode.a0;
				rootNode.childNode = rootNode.childNode[0].childNode;
				for (i = 0; i<rootNode.childNode.length;i++){
					rootNode.childNode[i].parentNode = rootNode;
				}
				rootNode = this.simplifySkeleton(rootNode);
				//console.log("pass1in");
				//console.log(rootNode.p0);
			} else {
				rootNode.childNode[0] = this.simplifySkeleton(rootNode.childNode[0]);
			}
		}else{
			for (let i = 0; i<rootNode.childNode.length;i++){
				rootNode.childNode[i] = this.simplifySkeleton(rootNode.childNode[i]);
			}
		}




		return rootNode;
	},


	generateSegmentsHermite: function (rootNode, lengthDivisions = 4, radialDivisions = 8) {
		var stack = [];
		stack.push(rootNode);
		var centre = [];

		while (stack.length > 0) {
			let currentNode = stack.pop();

			// for (let i=0; i<currentNode.childNode.length; i++) {
			// 	stack.push(currentNode.childNode[i]);
			// }
			for (let i= 0; i< currentNode.childNode.length; i++) {
				 	stack.push(currentNode.childNode[i]);
				 }
			var t = 0;
			for (let i=0;i<lengthDivisions;i++){
				t = (i)/(lengthDivisions-1);
				if (currentNode.parentNode === undefined){
					//console.log(currentNode);
					//Normaliser les tangentes?
					//On peut hard code (0,1,0) au lieu de mettre les memes peut etre
					centre.push(this.hermite(currentNode.p0,currentNode.p1,
						currentNode.p1.clone().sub(currentNode.p0.clone()),currentNode.p1.sub(currentNode.p0),t));
					currentNode.centre.push(this.hermite(currentNode.p0,currentNode.p1,
						currentNode.p1.clone().sub(currentNode.p0.clone()),currentNode.p1.sub(currentNode.p0),t));

				}else{
					//Normaliser les tangentes?
					centre.push(this.hermite(currentNode.p0,currentNode.p1,
						(currentNode.parentNode.p1.clone()).sub(currentNode.parentNode.p0),(currentNode.p1.clone()).sub(currentNode.p0),t));
					currentNode.centre.push(this.hermite(currentNode.p0,currentNode.p1,
						(currentNode.parentNode.p1.clone()).sub(currentNode.parentNode.p0),(currentNode.p1.clone()).sub(currentNode.p0),t));
				}

				if (currentNode.parentNode === undefined && i===0){
					//fleur initiale
					currentNode.sections.push([]);
					currentNode.sections[0][0]= new THREE.Vector3(currentNode.a0,0,0);
					for (let k=1; k<radialDivisions;k++){
						let rotationpetale = new THREE.Matrix4();
						rotationpetale.makeRotationAxis(new THREE.Vector3(0,1,0),(2*Math.PI*k)/radialDivisions)
						currentNode.sections[0][k] = (currentNode.sections[0][0].clone()).applyMatrix4(rotationpetale);
					}
				}else{
					let rotationv0v1 = new THREE.Matrix4();
					//On n'a pas acces a hermite(i+1) donc on fait i-1 vers i
					let v1 = centre[centre.length-1][1].normalize();
					let v0;
					//faire une cond pour cross=0 check
					//currentNode.sections[i] = [];
					//Gestion du changement de node
					let petale;
					if (i===0){
						petale = (currentNode.parentNode.sections[lengthDivisions-1][0].clone()).sub(currentNode.parentNode.centre[currentNode.parentNode.centre.length-1][0]);
						v0 = currentNode.parentNode.centre[currentNode.parentNode.centre.length-1][1].normalize();
					}else{
						petale = (currentNode.sections[i-1][0].clone()).sub(centre[centre.length-2][0]);
						v0 = centre[centre.length-2][1].normalize();
						}

					if (v0.dot(v1)<1-1e-6){
						let rotTable = this.findRotation(v0,v1);
						rotationv0v1.makeRotationAxis(rotTable[0].normalize(),rotTable[1]);}
					//console.log(i);
					//console.log(currentNode.sections);
					petale.applyMatrix4(rotationv0v1);
					petale.normalize();
					//petale = (petale.clone()).multiplyScalar(0.25);
					petale = (petale.clone()).multiplyScalar(t*currentNode.a1+(1-t)*currentNode.a0);
					//console.log(t*currentNode.a1+(1-t)*currentNode.a0);

					//console.log(petale.clone().dot(v1));
					//console.log(centre[centre.length-1]);
					//console.log(centre[centre.length-1][0]);
					currentNode.sections.push([]);
					currentNode.sections[i][0] = (petale.clone()).add(centre[centre.length-1][0]);
					for (let k=1; k<radialDivisions;k++) {
						let rotationpetale = new THREE.Matrix4();
						let pistil = centre[centre.length - 1][0];
						rotationpetale.makeRotationAxis(v1.normalize(), (2 * Math.PI * k) / radialDivisions);

						//console.log(rotationpetale.determinant())
						//console.log((petale.clone()).applyMatrix4(rotationpetale).length());
						//console.log((petale.clone()).applyMatrix4(rotationpetale).dot(v1));
						currentNode.sections[i][k] = (petale.clone()).applyMatrix4(rotationpetale).add(pistil);
					}
					//console.log(this.meanPoint([currentNode.sections[i][0],currentNode.sections[i][1],
						//currentNode.sections[i][2],currentNode.sections[i][3],currentNode.sections[i][4]]));
					//console.log(centre[centre.length-1][0]);
					//console.log(this.meanPoint([currentNode.sections[i][0],currentNode.sections[i][1],
					//	currentNode.sections[i][2],currentNode.sections[i][3],currentNode.sections[i][4]]).sub(centre[centre.length-1][0]));
					// if (currentNode.p0.y == 1){
					// console.log(currentNode.sections[i]);}
				}

			}



		}


		return rootNode;
	},

	//Marche PEUT-ETRE, si ca marche pas ez fixx :)
	hermite: function (h0, h1, v0, v1, t) {
		//Est-ce que toArray change le array?
		h0 = h0.toArray();
		h1 = h1.toArray();
		v0 = v0.toArray();
		v1 = v1.toArray();
		var dp = [];
		var p = [];
		for (j=0;j<3;j++){
			//Conversion
			var points = new THREE.Vector4(h0[j], h1[j], v0[j], v1[j]);
			const conversion = new THREE.Matrix4().set(1, 0, 0, 0, 1, 0, 1 / 3, 0, 0, 1, 0, -1 / 3, 0, 1, 0, 0);
			points = points.applyMatrix4(conversion);

			//Est-ce que toArray change le array?
			points = points.toArray();

			//Casteljau
			for (k = 1; k <= 4; k++) {
				for (i = 0; i <= 3 - k; i++) {
					points[i] = (1 - t) * points[i] + t * points[i + 1];
					//console.log(points[i] + " it [i,k]" + i + ',' + k);
					//Ca le fait deux fois (i=0 et i=1) mais la derniere c'est la bonne smile
					if (k == 2) {
						dp[j] = 3 * (points[1] - points[0]);
					}
				}
			}

			p[j] = points[0];
		}
		p = new THREE.Vector3().fromArray(p);
		dp = new THREE.Vector3().fromArray(dp);
		return [p, dp];
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