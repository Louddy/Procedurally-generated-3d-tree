TP3.Render = {
	drawTreeRough: function (rootNode, scene, alpha, radialDivisions = 8, leavesCutoff = 0.1, leavesDensity = 10, matrix = new THREE.Matrix4()) {
		var stack = [];
		var cylinderGeometries = [];
		var leafGeometries = [];

		const branchMaterial = new THREE.MeshLambertMaterial({color : 0x8B5A2B});
		const leafMaterial = new THREE.MeshPhongMaterial({side: THREE.DoubleSide,color : 0x3A5F0B});

		stack.push(rootNode);

		while (stack.length > 0) {
			var currentNode = stack.pop();

			for (var i = 0; i < Math.min(currentNode.childNode.length,1); i++) {
				stack.push(currentNode.childNode[i]);
			}

			var middleVec = currentNode.p1.add(currentNode.p0).multiplyScalar(0.5);

			var dist = currentNode.p0.distanceTo(currentNode.p1);
			var cylinderGeometry = new THREE.CylinderBufferGeometry(currentNode.a0, currentNode.a1,
				dist, radialDivisions);

			cylinderGeometry.rotateX(Math.PI / 2);

			var p0moinsp1 = new THREE.Vector3();
			p0moinsp1.add(currentNode.p0);
			p0moinsp1.sub(currentNode.p1);
			cylinderGeometry.lookAt(p0moinsp1);

			var translate = new THREE.Matrix4();
			translate.makeTranslation(middleVec.x, middleVec.y, middleVec.z);
			cylinderGeometry.applyMatrix4 (translate);

			// Feuilles
			if ((currentNode.a0 < alpha * leavesCutoff) || (currentNode.childNode.length == 0)) {
				for (i = 0; i < leavesDensity; i++) {
					var leafGeometry = new THREE.PlaneBufferGeometry(alpha/2, alpha/2);
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
					var radiusVector= new THREE.Vector3();
					radiusVector = p0moinsp1.normalize().cross(new THREE.Vector3(0, 0, 1)).normalize();
					radiusVector.multiplyScalar(radius);

					var transX;
					var transY;
					var transZ;
					var p0moinsp1plusalpha = p0moinsp1.multiplyScalar(1+(alpha/p0moinsp1.length()));

					// Je fais la translation vers middleVec et non currentNode.p0 parce que sinon les branches dépassent malgré le (p0-p1) * (1+alpha
					if (currentNode.a0 < alpha * leavesCutoff) {
						transX = currentNode.p0.x + (p0moinsp1.x * Math.random()) + radiusVector.x;
						transY = currentNode.p0.y + (p0moinsp1.y * Math.random()) + radiusVector.y;
						transZ = currentNode.p0.z + (p0moinsp1.z * Math.random()) + radiusVector.z;
					} else {
						console.log("pass");
						transX = currentNode.p0.x + (p0moinsp1plusalpha.x * Math.random()) + radiusVector.x;
						transY = currentNode.p0.y + (p0moinsp1plusalpha.y * Math.random()) + radiusVector.y;
						transZ = currentNode.p0.z + (p0moinsp1plusalpha.z * Math.random()) + radiusVector.z;
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
		// const f32vertices = new Float32Array(vertices);
		// const geometry = new THREE.BufferGeometry();
		// geometry.setAttribute("position", new THREE.BufferAttribute(f32vertices, 3));

		console.log(rootNode);
		var stack = [];
		stack.push(rootNode);

		while (stack.length > 0) {
			var currentNode = stack.pop();

			for (var i=0; i<currentNode.childNode.length; i++) {
				stack.push(currentNode.childNode[i]);
			}

			//Nec?
			currentNode.indice = [];
			//console.log(currentNode.indice);
			//On push les sommets dans une belle liste
			for (let i=0;i<currentNode.sections.length;i++){
				currentNode.indice[i] = vertices.length/3;
				for (let j=0;j<currentNode.sections[i].length;j++){
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
				//console.log(currentNode.sections[i])
				index0top = currentNode.indice[i+1];
				index0bot = currentNode.indice[i];
				//console.log("bot:" + index0bot+ " top:" + index0top);
				for (let j=0;j<currentNode.sections[i].length;j++){
					// const a = currentNode.sections[i+1][j]
					// const b = currentNode.sections[i+1][j+1]
					// const c = currentNode.sections[i][j+1]

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
			//cond + clean?
			if (currentNode.childNode.length == 0){
				let index0 = currentNode.indice[currentNode.sections.length-1];
				indices.push(index0 + 0, index0 + 2, index0 + 1);
				indices.push(index0 + 2, index0 + 4, index0 + 3);
				indices.push(index0 + 2, index0 + 0, index0 + 4);
			}

			var middleVec = currentNode.p1.add(currentNode.p0).multiplyScalar(0.5);

			var dist = currentNode.p0.distanceTo(currentNode.p1);

			var translate = new THREE.Matrix4();
			translate.makeTranslation(middleVec.x, middleVec.y, middleVec.z);

			var p0moinsp1 = new THREE.Vector3();
			p0moinsp1.add(currentNode.p0);
			p0moinsp1.sub(currentNode.p1);




		}
		//On rajoute la base (Est-ce que l'on veut ca)
		indices.push(0,2,1);
		indices.push(2,4,3);
		indices.push(2,0,4);

		const f32vertices = new Float32Array(vertices);
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute("position", new THREE.BufferAttribute(f32vertices, 3));

		geometry.setIndex(indices);
		geometry.computeVertexNormals();

		const branchMaterial = new THREE.MeshLambertMaterial({side: THREE.DoubleSide,color : 0x8B5A2B});
		const mesh = new THREE.Mesh( geometry, branchMaterial );
		scene.add(mesh);

		console.log(vertices);
	},
	
	updateTreeHermite: function (trunkGeometryBuffer, leavesGeometryBuffer, rootNode) {
		//TODO
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