
TP3.Physics = {
	
	initTree: function (rootNode) {
		
		this.computeTreeMass(rootNode);
		
		var stack = [];
		stack.push(rootNode);
		
		while (stack.length > 0) {
			var currentNode = stack.pop();
			for (var i=0; i<currentNode.childNode.length; i++) {
				stack.push(currentNode.childNode[i]);
			}
			
			currentNode.bp0 = currentNode.p0.clone();
			currentNode.bp1 = currentNode.p1.clone();
			currentNode.rp0 = currentNode.p0.clone();
			currentNode.rp1 = currentNode.p1.clone();
			currentNode.vel = new THREE.Vector3();
			currentNode.strength = currentNode.a0;
		}
	},
	
	computeTreeMass: function (node) {
		var mass = 0;
		
		for (var i=0; i<node.childNode.length; i++) {
			mass += this.computeTreeMass(node.childNode[i]);
		}
		mass += node.a1;
		node.mass = mass;
		
		return mass;
	},

	applyForces: function (node, dt, time) {

		var u = Math.sin(1 * time) * 4;
		u += Math.sin(2.5 * time) * 2;
		u += Math.sin(5 * time) * 0.4;

		var v = Math.cos(1 * time + 56485) * 4;
		v += Math.cos(2.5 * time + 56485) * 2;
		v += Math.cos(5 * time + 56485) * 0.4;

		// Ajouter le vent
		node.vel.add(new THREE.Vector3(u/Math.sqrt(node.mass), 0, v/Math.sqrt(node.mass)).multiplyScalar(dt));
		// Ajouter la gravite
		node.vel.add(new THREE.Vector3(0, -node.mass, 0).multiplyScalar(dt));

		// ---------- Application de la vélocité ------------------------------
		var p1moinsp0 = new THREE.Vector3();
		p1moinsp0.add(node.p1);
		p1moinsp0.sub(node.p0);
		p1moinsp0.normalize();

		var p1tplusdtmoinsp0 = new THREE.Vector3();
		p1tplusdtmoinsp0.add(node.p1);
		p1tplusdtmoinsp0.add(node.vel.clone().multiplyScalar(dt));
		p1tplusdtmoinsp0.sub(node.p0);
		p1tplusdtmoinsp0.normalize();

		var rotateBranch = new THREE.Matrix4();

		if (p1moinsp0.dot(p1tplusdtmoinsp0) > 1e-6) { // Sinon le squelette disparait devant nos yeux après quelques secondes.
			[rotAxis, rotAngle] = TP3.Geometry.findRotation(p1moinsp0, p1tplusdtmoinsp0);
		}

		rotateBranch.makeRotationAxis(rotAxis, rotAngle);

		var toOrigin = new THREE.Matrix4();
		var fromOrigin = new THREE.Matrix4();
		var transform = new THREE.Matrix4();
		toOrigin.makeTranslation(-node.p0.x, -node.p0.y, -node.p0.z);
		fromOrigin.makeTranslation(node.p0.x, node.p0.y, node.p0.z);
		transform.multiply(fromOrigin);
		transform.multiply(rotateBranch);
		transform.multiply(toOrigin);

		var p1t = node.p1.clone();
		const mesure = (node.p1.clone().sub(node.p0)).length() - (node.bp1.clone().sub(node.bp0)).length();
		console.log(node.p1);
		console.log(mesure);
		//console.log(transform);
		node.p1.applyMatrix4(transform);

		//console.log((node.p1.clone().sub(node.p0)).length() + 'b');

		// ---------- Projection de la vélocité -------------------------------
		var velDir = new THREE.Vector3();
		velDir.add(node.p1);
		velDir.sub(p1t);
		var newVel = TP3.Geometry.project(node.vel, velDir);
		node.vel = newVel.clone();

		// ---------- Force de restitution ------------------------------------
		var initialDir = new THREE.Vector3();
		var actualDir = new THREE.Vector3();
		initialDir.add(node.rp1);
		initialDir.sub(node.rp0);
		var restitutionVel = initialDir.clone();
		initialDir.normalize();
		actualDir.add(node.p1);
		actualDir.sub(node.p0);
		actualDir.normalize();

		[velRotAxis, velRotAngle] = TP3.Geometry.findRotation(initialDir, actualDir);
		var velRotAngleSq = (velRotAngle*velRotAngle);
		var rotateVel = new THREE.Matrix4();
		rotateVel.makeRotationAxis(velRotAxis, -velRotAngleSq);

		// var restitutionVel = initialDir.clone(); // va avant le normalize? surement

		restitutionVel.applyMatrix4(rotateVel);
		restitutionVel.multiplyScalar(node.a0*1000);
		node.vel.add(restitutionVel);

		// ---------- Facteur d'amortissement ---------------------------------
		node.vel.multiplyScalar(0.7);

		//pt prendre cette vélocité et en faire une matrice de transformation avec transform? entk ça prend un matrice
		//de transformation à sauvegarder dans node.

		// Appel recursif sur les enfants
		for (var i=0; i<node.childNode.length; i++) {
			node.childNode[i].p0.applyMatrix4(transform);
			node.childNode[i].p1.applyMatrix4(transform);

			// if (node.childNode[i].childNode.length == 0) {
			// 	var xd1 = new THREE.Vector3();
			// 	var xd2 = new THREE.Vector3();
			// 	xd1.add(node.childNode[i].bp1);
			// 	xd1.sub(node.childNode[i].bp0);
			// 	xd2.add(node.childNode[i].p1);
			// 	xd2.sub(node.childNode[i].p0);
			//
			// 	//console.log("conservation ?");
			// 	//console.log(xd1.length());
			// 	//console.log(xd2.length());
			// }

			// console.log(node.childNode[i].childNode.length);

			this.applyForces(node.childNode[i], dt, time);
		}
		//console.log(node);
	}





}