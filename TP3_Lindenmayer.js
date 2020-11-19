TP3.Lindenmayer = {
	
	iterateGrammar: function (str, dict, iters) {
		keys = Object.keys(dict);
		values = Object.values(dict);

		var endstring = "";
		var split = str.split("");

		for (it = 0; it < iters; it++) {

			for (i = 0; i < split.length; i++) {
				for (j = 0; j < keys.length; j++) {
					if (split[i] == keys[j]) {
						endstring += values[j].default;
						break;
					}
				}
			}

			if (it != iters-1) {
				split =	endstring.split("");
				endstring = "";
			}
		}
		return endstring;
	},
	
	iterateGrammarProb: function (str, dict, iters) {
		keys = Object.keys(dict);
		values = Object.values(dict);

		var endstring = "";
		var split = str.split("");

		for (it = 0; it < iters; it++) {
			for (i = 0; i < split.length; i++) {
				for (j = 0; j < keys.length; j++) {
					if (split[i] == keys[j]) {
						if (values[j].prob != null) {
							rand = Math.random();
							var sum = 0;

							for (k = 0; k < values[j].prob.length; k++) {
								sum += values[j].prob[k];

								if (rand < sum) {
									endstring += values[j].val[k];
									break;
								}
							}
						} else {
							endstring += values[j].default;
						}

						break;
					}
				}
			}

			if (it != iters-1) {
				split =	endstring.split("");
				endstring = "";
			}
		}
		return endstring;
	}
};