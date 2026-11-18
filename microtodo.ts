namespace $ {

	export class $bog_microtodo_step extends $giper_baza_dict.with({
		Title: $giper_baza_atom_text,
		Done: $giper_baza_atom_bool,
	}) {}

	export class $bog_microtodo_task extends $giper_baza_dict.with({
		Title: $giper_baza_atom_text,
		Done: $giper_baza_atom_bool,
		Important: $giper_baza_atom_bool,
		Due: $giper_baza_atom_text,
		Repeat: $giper_baza_atom_text,
		Note: $giper_baza_atom_text,
		Steps: $giper_baza_list_link.to( ()=> $bog_microtodo_step ),
		Created: $giper_baza_atom_real,
		Finished: $giper_baza_atom_real,
	}) {}

	export class $bog_microtodo_list extends $giper_baza_dict.with({
		Title: $giper_baza_atom_text,
		Tasks: $giper_baza_list_link.to( ()=> $bog_microtodo_task ),
		Invite: $giper_baza_atom_text,
		Invites: $giper_baza_list_str,
	}) {}

	export function $bog_microtodo_invite_make( land: $giper_baza_land ) {
		const invite = land.$.$giper_baza_auth.grab()
		land.give( invite.pass(), $giper_baza_rank_rule )
		const list = land.Data( $bog_microtodo_list )
		list.Invite( 'auto' )!.val( invite.toString() + invite.toStringPrivate() )
		const invites = list.Invites( 'auto' )!
		invites.items([ ... invites.items(), invite.pass().lord().str ])
		return invite
	}

	export function $bog_microtodo_invite_close( land: $giper_baza_land ) {
		const key = land.Data( $bog_microtodo_list ).Invite()?.val() ?? ''
		if( key ) land.give( $giper_baza_auth.from( key ).pass(), $giper_baza_rank_deny )
		land.Data( $bog_microtodo_list ).Invite( 'auto' )!.val( '' )
	}

	export function $bog_microtodo_invite_open( land: $giper_baza_land, key: string ) {
		const invite = $giper_baza_auth.from( key )
		return land.lord_rank( invite.pass().lord() ) >= $giper_baza_rank_rule
	}

	export class $bog_microtodo_invite extends $mol_object {

		@ $mol_action
		static proxy( land: $giper_baza_land, key: string ) {
			const invite = $giper_baza_auth.from( key )
			return $giper_baza_land.make({ $: land.$, link: ()=> land.link(), auth: ()=> invite })
		}

		@ $mol_action
		static accept( land: $giper_baza_land, key: string, pass: $giper_baza_auth_pass ) {
			const proxy = this.proxy( land, key )
			proxy.units_steal( land )
			proxy.give( pass, $giper_baza_rank_post( 'just' ) )
			land.units_steal( proxy )
			land.broadcast()
		}

	}

	export class $bog_microtodo_home extends $giper_baza_dict.with({
		Inbox: $giper_baza_list_link.to( ()=> $bog_microtodo_task ),
		Lists: $giper_baza_list_link.to( ()=> $bog_microtodo_list ),
		Day: $giper_baza_dict_to( $giper_baza_atom_text ),
	}, 'bog_microtodo' ) {}

	export function $bog_microtodo_day( shift = 0 ) {
		return new $mol_time_moment().shift({ day: shift }).toString( 'YYYY-MM-DD' )
	}

	export function $bog_microtodo_due_next( due: string, repeat: string ) {
		const moment = new $mol_time_moment( due )
		if( repeat === 'day' ) return moment.shift({ day: 1 }).toString( 'YYYY-MM-DD' )
		if( repeat === 'week' ) return moment.shift({ day: 7 }).toString( 'YYYY-MM-DD' )
		if( repeat === 'month' ) return moment.shift({ month: 1 }).toString( 'YYYY-MM-DD' )
		if( repeat === 'year' ) return moment.shift({ year: 1 }).toString( 'YYYY-MM-DD' )
		if( repeat === 'weekday' ) {
			let next = moment.shift({ day: 1 })
			while( next.weekday >= $mol_time_moment_weekdays.saturday ) next = next.shift({ day: 1 })
			return next.toString( 'YYYY-MM-DD' )
		}
		return ''
	}

	export function $bog_microtodo_due_label( due: string ) {
		if( !due ) return ''
		if( due === $bog_microtodo_day() ) return 'Сегодня'
		if( due === $bog_microtodo_day( 1 ) ) return 'Завтра'
		if( due === $bog_microtodo_day( -1 ) ) return 'Вчера'
		return new $mol_time_moment( due ).toString( 'WD, D Month', 'ru' )
	}

}
