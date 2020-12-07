TP3.Render = {
	drawTreeRough: function (rootNode, scene, alpha, radialDivisions = 8, leavesCutoff = 0.1, leavesDensity = 10, matrix = new THREE.Matrix4()) {
		var stack = [];
		var cylinderGeometries = [];
		var leafGeometries = [];

		const branchMaterial = new THREE.MeshLambertMaterial({color : 0x8B5A2B});
		const leafMaterial = new THREE.MeshPhongMaterial({color : 0x3A5F0B});

		stack.push(rootNode);

		while (stack.length > 0) {
			var currentNode = stack.pop();

			for (var i = 0; i < currentNode.childNode.length; i++) {
				stack.push(currentNode.childNode[i]);
			}

			var middleVec = currentNode.p1.clone();
			middleVec.add(currentNode.p0);
			middleVec.multiplyScalar(0.5);

			var dist = currentNode.p0.distanceTo(currentNode.p1);
			var cylinderGeometry = new THREE.CylinderBufferGeometry(currentNode.a0, currentNode.a1,
				dist, radialDivisions);

			cylinderGeometry.rotateX(Math.PI / 2);

			var p1moinsp0 = new THREE.Vector3();
			p1moinsp0.add(currentNode.p1);
			p1moinsp0.sub(currentNode.p0);
			p1moinsp0.normalize();

			var p0moinsp1 = new THREE.Vector3();
			p0moinsp1.add(currentNode.p0);
			p0moinsp1.sub(currentNode.p1);
			cylinderGeometry.lookAt(p0moinsp1);

			var translate = new THREE.Matrix4();
			translate.makeTranslation(middleVec.x, middleVec.y, middleVec.z);
			cylinderGeometry.applyMatrix4(translate);

			// Feuilles
			if ((currentNode.a0 < alpha * leavesCutoff) || (currentNode.childNode.length == 0)) {
				for (i = 0; i < leavesDensity; i++) {
					var leafGeometry = new THREE.PlaneBufferGeometry(alpha, alpha);
					var rotation = Math.random() * 2 * Math.PI;
					leafGeometry.rotateX(rotation);
					leafGeometry.rotateY(rotation);
					leafGeometry.rotateZ(rotation);

					var posNeg;
					if (Math.random() < 0.5) {
						posNeg = 1;
					} else {
						posNeg = -1;
					}

					var radius = ((alpha / 2) * Math.random()) * posNeg;
					var radiusVector = new THREE.Vector3();
					radiusVector = p0moinsp1.normalize().cross(new THREE.Vector3(0, 0, 1)).normalize();
					radiusVector.multiplyScalar(radius);
					radiusVector.applyAxisAngle(p1moinsp0, rotation);

					var transX;
					var transY;
					var transZ;

					var p0moinsp1plusalpha = p0moinsp1.multiplyScalar(1+(alpha/p0moinsp1.length()));

					if (currentNode.childNode.length == 0) {
						transX = currentNode.p0.x + (p0moinsp1plusalpha.x * Math.random()) + radiusVector.x;
						transY = currentNode.p0.y + (p0moinsp1plusalpha.y * Math.random()) + radiusVector.y;
						transZ = currentNode.p0.z + (p0moinsp1plusalpha.z * Math.random()) + radiusVector.z;
					} else {
						transX = currentNode.p0.x + (p0moinsp1.x * Math.random()) + radiusVector.x;
						transY = currentNode.p0.y + (p0moinsp1.y * Math.random()) + radiusVector.y;
						transZ = currentNode.p0.z + (p0moinsp1.z * Math.random()) + radiusVector.z;
					}

					translate.makeTranslation(transX, transY, transZ);
					leafGeometry.applyMatrix4(translate);

					leafGeometries.push(leafGeometry);
				}
			}

			cylinderGeometries.push(cylinderGeometry);
		}

		var cylinderMergedGeometries = THREE.BufferGeometryUtils.mergeBufferGeometries(cylinderGeometries);
		var leafMergedGeometries = THREE.BufferGeometryUtils.mergeBufferGeometries(leafGeometries);
		var cylinders = new THREE.Mesh(cylinderMergedGeometries, branchMaterial);
		var leaves = new THREE.Mesh(leafMergedGeometries, leafMaterial);
		scene.add(cylinders);
		scene.add(leaves);
	},
	
	drawTreeHermite: function (rootNode, scene, alpha, leavesCutoff = 0.1, leavesDensity = 10, matrix = new THREE.Matrix4()) {
		const vertices = [];
		const indices = [];
		var leafVertices = [];

		console.log(rootNode);
		var stack = [];
		stack.push(rootNode);

		while (stack.length > 0) {
			var currentNode = stack.pop();

			for (var i=0; i<currentNode.childNode.length; i++) {
				stack.push(currentNode.childNode[i]);
			}

			currentNode.indice = [];
			currentNode.leafIndice = [];

			if (!currentNode.parentNode){
				currentNode.indice[0] = 0;
				for (let j=0;j<currentNode.sections[0].length;j++){
					vertices.push(currentNode.sections[0][j].x);
					vertices.push(currentNode.sections[0][j].y);
					vertices.push(currentNode.sections[0][j].z);

				}
			}

			//On push les sommets dans une belle liste
			for (let i=0;i<currentNode.sections.length;i++) {
				currentNode.indice[i] = vertices.length/3;

				for (let j=0;j<currentNode.sections[i].length;j++) {
					vertices.push(currentNode.sections[i][j].x);
					vertices.push(currentNode.sections[i][j].y);
					vertices.push(currentNode.sections[i][j].z);
				}
			}

			//indice du debut de top
			let index0top;
			//indice du debut de top
			let index0bot;

			//lien lien entre section[i+1] et section[i] i = 1 et length
			for (i=0;i<currentNode.sections.length-1; i++){
				if (i==0 && currentNode.parentNode){
					index0top = currentNode.indice[i+1];
					index0bot = currentNode.parentNode.indice[currentNode.sections.length-1];
				}else{
					index0top = currentNode.indice[i+1];
					index0bot = currentNode.indice[i];
				}

				for (let j=0;j<currentNode.sections[i].length;j++){
					let a = index0top+j;
					let b = index0top+(j+1)%5;
					let c = index0bot+(j+1)%5;
					indices.push(a,b,c);

					a = index0top+j;
					b = index0bot+(j+1)%5;
					c = index0bot+j;
					indices.push(a,b,c);
				}
			}
			//Bout de branche
			if (currentNode.childNode.length == 0){
				let index0 = currentNode.indice[currentNode.sections.length-1];
				indices.push(index0 + 0, index0 + 2, index0 + 1);
				indices.push(index0 + 2, index0 + 4, index0 + 3);
				indices.push(index0 + 2, index0 + 0, index0 + 4);
			}

			// Feuilles
			if ((currentNode.a0 < alpha * leavesCutoff) || (currentNode.childNode.length == 0)) {
				for (i = 0; i < leavesDensity; i++) {
					currentNode.leafIndice.push(leafVertices.length);

					// Création d'un triangle équilatéral d'arête alpha
					var rotate = new THREE.Matrix4();
					var trianglep1 = new THREE.Vector3(alpha / 2, 0, 0);
					var trianglep2 = new THREE.Vector3(alpha / 2, 0, 0);
					var trianglep3 = new THREE.Vector3(alpha / 2, 0, 0);

					rotate.makeRotationY(THREE.MathUtils.degToRad(120));
					trianglep2.applyMatrix4(rotate);
					rotate.makeRotationY(THREE.MathUtils.degToRad(240));
					trianglep3.applyMatrix4(rotate);

					var rotation = Math.random() * 2 * Math.PI;

					rotate.makeRotationX(rotation);
					trianglep1.applyMatrix4(rotate);
					trianglep2.applyMatrix4(rotate);
					trianglep3.applyMatrix4(rotate);

					rotate.makeRotationY(rotation);
					trianglep1.applyMatrix4(rotate);
					trianglep2.applyMatrix4(rotate);
					trianglep3.applyMatrix4(rotate);

					rotate.makeRotationZ(rotation);
					trianglep1.applyMatrix4(rotate);
					trianglep2.applyMatrix4(rotate);
					trianglep3.applyMatrix4(rotate);

					var posNeg;
					if (Math.random() < 0.5) {
						posNeg = 1;
					} else {
						posNeg = -1;
					}

					var p0moinsp1 = new THREE.Vector3();
					var p1moinsp0 = new THREE.Vector3();
					p0moinsp1.add(currentNode.p0);
					p0moinsp1.sub(currentNode.p1);
					p1moinsp0.add(currentNode.p1);
					p1moinsp0.sub(currentNode.p0);

					var radius = ((alpha / 2) * Math.random()) * posNeg;
					var radiusVector = new THREE.Vector3();
					radiusVector = p0moinsp1.normalize().cross(new THREE.Vector3(0, 0, 1)).normalize();
					radiusVector.multiplyScalar(radius);
					radiusVector.applyAxisAngle(p1moinsp0, rotation);

					var transX;
					var transY;
					var transZ;

					var p0moinsp1plusalpha = p0moinsp1.multiplyScalar(1+(alpha/p0moinsp1.length()));

					if (currentNode.childNode.length == 0) {
						transX = currentNode.p0.x + (p0moinsp1plusalpha.x * Math.random()) + radiusVector.x;
						transY = currentNode.p0.y + (p0moinsp1plusalpha.y * Math.random()) + radiusVector.y;
						transZ = currentNode.p0.z + (p0moinsp1plusalpha.z * Math.random()) + radiusVector.z;
					} else {
						transX = currentNode.p0.x + (p0moinsp1.x * Math.random()) + radiusVector.x;
						transY = currentNode.p0.y + (p0moinsp1.y * Math.random()) + radiusVector.y;
						transZ = currentNode.p0.z + (p0moinsp1.z * Math.random()) + radiusVector.z;
					}

					var translate = new THREE.Matrix4();

					translate.makeTranslation(transX, transY, transZ);
					trianglep1.applyMatrix4(translate);
					trianglep2.applyMatrix4(translate);
					trianglep3.applyMatrix4(translate);

					leafVertices.push(trianglep1.x);
					leafVertices.push(trianglep1.y);
					leafVertices.push(trianglep1.z);

					leafVertices.push(trianglep2.x);
					leafVertices.push(trianglep2.y);
					leafVertices.push(trianglep2.z);

					leafVertices.push(trianglep3.x);
					leafVertices.push(trianglep3.y);
					leafVertices.push(trianglep3.z);
				}
			}
		}

		//On rajoute la base
		indices.push(0,2,1);
		indices.push(2,4,3);
		indices.push(2,0,4);

		const f32vertices = new Float32Array(vertices);
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute("position", new THREE.BufferAttribute(f32vertices, 3));

		geometry.setIndex(indices);
		geometry.computeVertexNormals();

		const f32leafVertices = new Float32Array(leafVertices);
		const leafGeometry = new THREE.BufferGeometry();
		leafGeometry.setAttribute("position", new THREE.BufferAttribute(f32leafVertices, 3));

		leafGeometry.computeVertexNormals();

		const branchMaterial = new THREE.MeshLambertMaterial({side: THREE.DoubleSide, color : 0x8B5A2B});
		const mesh = new THREE.Mesh( geometry, branchMaterial );

		const leafMaterial = new THREE.MeshPhongMaterial({side: THREE.DoubleSide, color : 0x3A5F0B});
		leafMaterial.flatShading = true;
		const leaves = new THREE.Mesh( leafGeometry, leafMaterial );

		scene.add(mesh);
		scene.add(leaves);

		return [geometry, leafGeometry];
	},
	
	updateTreeHermite: function (trunkGeometryBuffer, leavesGeometryBuffer, rootNode) {
		var stack = [];
		stack.push(rootNode);

		while (stack.length > 0) {
			var currentNode = stack.pop();

			for (var i = 0; i < currentNode.childNode.length; i++) {
				stack.push(currentNode.childNode[i]);
			}


			if (!currentNode.parentNode) {
				for (let i = 0; i < 20; i++) {
					let vertex = new THREE.Vector3(trunkGeometryBuffer[3*currentNode.indice[0] + (i*3)],
						trunkGeometryBuffer[3*currentNode.indice[0] + (i*3) + 1],
						trunkGeometryBuffer[3*currentNode.indice[0] + (i*3) + 2])
					vertex.applyMatrix4(currentNode.transform);

					trunkGeometryBuffer[3*currentNode.indice[0] + (i*3)] = vertex.x;
					trunkGeometryBuffer[3*currentNode.indice[0] + (i*3) + 1] = vertex.y;
					trunkGeometryBuffer[3*currentNode.indice[0] + (i*3) + 2] = vertex.z;

				}
			} else {
				for (let i = 0; i < 15; i++) {
					let vertex = new THREE.Vector3(trunkGeometryBuffer[3*currentNode.indice[1] + (i*3)],
						trunkGeometryBuffer[3*currentNode.indice[1] + (i*3) + 1],
						trunkGeometryBuffer[3*currentNode.indice[1] + (i*3) + 2])
					vertex.applyMatrix4(currentNode.transform);

					trunkGeometryBuffer[3*currentNode.indice[1] + (i*3)] = vertex.x;
					trunkGeometryBuffer[3*currentNode.indice[1] + (i*3) + 1] = vertex.y;
					trunkGeometryBuffer[3*currentNode.indice[1] + (i*3) + 2] = vertex.z;

				}
			}

			for (let i = 0; i < currentNode.leafIndice.length; i++) { //pour chaque feuille
				for (let j = 0; j < 3; j++) { // pour chaque point

					let trianglePoint = new THREE.Vector3(leavesGeometryBuffer[currentNode.leafIndice[i] + (j*3)],
						leavesGeometryBuffer[currentNode.leafIndice[i] + (j*3) + 1],
						leavesGeometryBuffer[currentNode.leafIndice[i] + (j*3) + 2]);

					trianglePoint.applyMatrix4(currentNode.transform);

					leavesGeometryBuffer[currentNode.leafIndice[i] + (j*3)] = trianglePoint.x;
					leavesGeometryBuffer[currentNode.leafIndice[i] + (j*3) + 1] = trianglePoint.y;
					leavesGeometryBuffer[currentNode.leafIndice[i] + (j*3) + 2] = trianglePoint.z;
				}

			}
		}

	},
	
	drawTreeSkeleton: function (rootNode, scene, color = 0xffffff, matrix = new THREE.Matrix4()) {
		console.log(rootNode);
		var stack = [];
		stack.push(rootNode);
			
		var points = [];
		
		while (stack.length > 0) {
			var currentNode = stack.pop();
			
			for (var i=0; i<currentNode.childNode.length; i++) {
				stack.push(currentNode.childNode[i]);
			}
			
			points.push(currentNode.p0);
			points.push(currentNode.p1);
			
		}
		
		var geometry = new THREE.BufferGeometry().setFromPoints(points);
		var material = new THREE.LineBasicMaterial({color: color});
		var line = new THREE.LineSegments(geometry, material);
		line.applyMatrix4(matrix);
		scene.add(line);
		
		return line.geometry;
	},
	
	updateTreeSkeleton: function (geometryBuffer, rootNode) {
		
		var stack = [];
		stack.push(rootNode);
		
		var idx = 0;
		while (stack.length > 0) {
			var currentNode = stack.pop();
			
			for (var i=0; i<currentNode.childNode.length; i++) {
				stack.push(currentNode.childNode[i]);
			}
			geometryBuffer[idx * 6] = currentNode.p0.x;
			geometryBuffer[idx * 6 + 1] = currentNode.p0.y;
			geometryBuffer[idx * 6 + 2] = currentNode.p0.z;
			geometryBuffer[idx * 6 + 3] = currentNode.p1.x;
			geometryBuffer[idx * 6 + 4] = currentNode.p1.y;
			geometryBuffer[idx * 6 + 5] = currentNode.p1.z;
			
			idx++;
		}
	},
	
	
	drawTreeNodes: function (rootNode, scene, color = 0x00ff00, size = 0.05, matrix = new THREE.Matrix4()) {
		
		var stack = [];
		stack.push(rootNode);
			
		var points = [];
		
		while (stack.length > 0) {
			var currentNode = stack.pop();
			
			for (var i=0; i<currentNode.childNode.length; i++) {
				stack.push(currentNode.childNode[i]);
			}
			
			points.push(currentNode.p0);
			points.push(currentNode.p1);
			
		}
		
		var geometry = new THREE.BufferGeometry().setFromPoints(points);
		var material = new THREE.PointsMaterial({color: color, size: size});
		var points = new THREE.Points(geometry, material);
		points.applyMatrix4(matrix);
		scene.add(points);
		
	},
	
	
	drawTreeSegments: function (rootNode, scene, lineColor = 0xff0000, segmentColor = 0xffffff, orientationColor = 0x00ff00, matrix = new THREE.Matrix4()) {
		
		var stack = [];
		stack.push(rootNode);
			
		var points = [];
		var pointsS = [];
		var pointsT = [];
		
		while (stack.length > 0) {
			var currentNode = stack.pop();
			
			for (var i=0; i<currentNode.childNode.length; i++) {
				stack.push(currentNode.childNode[i]);
			}
			
			const segments = currentNode.sections;
			for (var i=0; i<segments.length-1; i++) {
				points.push(TP3.Geometry.meanPoint(segments[i]));
				points.push(TP3.Geometry.meanPoint(segments[i+1]));
			}
			for (var i=0; i<segments.length; i++) {
				pointsT.push(TP3.Geometry.meanPoint(segments[i]));
				pointsT.push(segments[i][0]);
			}
			
			for (var i=0; i<segments.length; i++) {
				
				for (var j=0; j<segments[i].length-1; j++) {
					pointsS.push(segments[i][j]);
					pointsS.push(segments[i][j+1]);
				}
				pointsS.push(segments[i][0]);
				pointsS.push(segments[i][segments[i].length-1]);
			}
		}
		
		var geometry = new THREE.BufferGeometry().setFromPoints(points);
		var geometryS = new THREE.BufferGeometry().setFromPoints(pointsS);
		var geometryT = new THREE.BufferGeometry().setFromPoints(pointsT);

		var material = new THREE.LineBasicMaterial({color: lineColor});
		var materialS = new THREE.LineBasicMaterial({color: segmentColor});
		var materialT = new THREE.LineBasicMaterial({color: orientationColor});
		
		var line = new THREE.LineSegments(geometry, material);
		var lineS = new THREE.LineSegments(geometryS, materialS);
		var lineT = new THREE.LineSegments(geometryT, materialT);
		
		line.applyMatrix4(matrix);
		lineS.applyMatrix4(matrix);
		lineT.applyMatrix4(matrix);
		
		scene.add(line);
		scene.add(lineS);
		scene.add(lineT);
		
	}
}