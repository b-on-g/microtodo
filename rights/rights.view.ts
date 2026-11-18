namespace $.$$ {

	export class $bog_microtodo_rights extends $.$bog_microtodo_rights {

		@ $mol_mem
		override gifts() {
			const land = this.land()
			const hidden = new Set([ '', land.link().lord().str, ... this.hidden() ])
			return [ ... land._gift.keys() ]
				.filter( lord => !hidden.has( lord ) )
				.reverse()
				.map( lord => this.Gift( new $giper_baza_link( lord ) ) )
		}

	}

}
