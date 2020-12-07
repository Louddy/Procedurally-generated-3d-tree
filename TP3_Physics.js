
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
			currentNode.branchVector = currentNode.p1.clone();
			currentNode.branchVector.sub(currentNode.p0);
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
		node.vel.add(new THREE.Vector3(u / Math.sqrt(node.mass), 0,
			v / Math.sqrt(node.mass)).multiplyScalar(dt));
		// Ajouter la gravite
		node.vel.add(new THREE.Vector3(0, -node.mass, 0).multiplyScalar(dt));


		// On applique la transformation de la branche parent à ses enfants.
		if (node.parentNode) {
			node.bp0.applyMatrix4(node.parentNode.transform);
			node.bp1.applyMatrix4(node.parentNode.transform);
		}

		// ---------- Application de la vélocité ------------------------------
		var p1moinsp0 = new THREE.Vector3();
		p1moinsp0.add(node.bp1);
		p1moinsp0.sub(node.bp0);
		p1moinsp0.normalize();

		var p1tplusdtmoinsp0 = new THREE.Vector3();
		p1tplusdtmoinsp0.add(node.bp1);
		p1tplusdtmoinsp0.add(node.vel.clone().multiplyScalar(dt));
		p1tplusdtmoinsp0.sub(node.bp0);
		p1tplusdtmoinsp0.normalize();

		var rotateBranch = new THREE.Matrix4();
		var transform = new THREE.Matrix4();


		if (p1moinsp0.dot(p1tplusdtmoinsp0) > 1e-6) { // Sinon le squelette disparait devant nos yeux après quelques secondes.
			[rotAxis, rotAngle] = TP3.Geometry.findRotation(p1moinsp0, p1tplusdtmoinsp0);
			rotateBranch.makeRotationAxis(rotAxis, rotAngle);

			var toOrigin = new THREE.Matrix4();
			var fromOrigin = new THREE.Matrix4();
			var transform = new THREE.Matrix4();
			toOrigin.makeTranslation(-node.bp0.x, -node.bp0.y, -node.bp0.z);
			fromOrigin.makeTranslation(node.bp0.x, node.bp0.y, node.bp0.z);
			transform.premultiply(toOrigin);
			transform.premultiply(rotateBranch);
			transform.premultiply(fromOrigin);
		}

		if (node.parentNode) {
			node.transform = transform.multiply(node.parentNode.transform);
		} else {
			node.transform = transform;
		}

		var p1t = node.p1.clone();

		node.p1.applyMatrix4(node.transform);

		// ---------- Projection de la vélocité -------------------------------
		var velDir = new THREE.Vector3();
		velDir.sub(node.p1);
		velDir.add(p1t);
		var newVel = TP3.Geometry.project(node.vel, velDir);
		node.vel = newVel.clone();

		// ---------- Force de restitution ------------------------------------
		/**
		 * Nous ne sommes pas certains de ce qu'il faut faire précisément ici.
		 */
		var initialDir = new THREE.Vector3();
		var actualDir = new THREE.Vector3();
		initialDir.add(node.rp1);
		initialDir.sub(node.rp0);
		initialDir.normalize();
		actualDir.add(node.p1);
		actualDir.sub(node.p0);
		actualDir.normalize();

		var restitutionVel = new THREE.Vector3();
		restitutionVel.add(node.rp1);
		restitutionVel.sub(node.p1);

		var rotateVel = new THREE.Matrix4();

		if (initialDir.dot(actualDir) > 1e-6) {
			[velRotAxis, velRotAngle] = TP3.Geometry.findRotation(initialDir, actualDir);
			var velRotAngleSq = (velRotAngle * velRotAngle);
			rotateVel.makeRotationAxis(velRotAxis, -velRotAngleSq);
		}

		restitutionVel.multiplyScalar(node.a0 * 100 * velRotAngleSq/(2*Math.PI));
		node.vel.add(restitutionVel);

		// ---------- Facteur d'amortissement ---------------------------------
		node.vel.multiplyScalar(0.7);

		// Appel recursif sur les enfants
		for (var i=0; i<node.childNode.length; i++) {
			this.applyForces(node.childNode[i], dt, time);
		}
	}





}