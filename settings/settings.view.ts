namespace $.$$ {

	export class $bog_microtodo_settings extends $.$bog_microtodo_settings {

		account_key() {
			const auth = this.$.$giper_baza_auth.current()
			return auth.toString() + auth.toStringPrivate()
		}

		lord_label() {
			return 'Аккаунт: ' + this.$.$giper_baza_auth.current().pass().lord().str
		}

		account_link() {
			return this.$.$mol_state_arg.make_link({ account: this.account_key() })
		}

		account_key_of( text: string ) {
			const raw = text.trim()
			const key = raw.match( /account=([^\/&\s]+)/ )?.[1] ?? raw
			const decoded = decodeURIComponent( key )
			return decoded.length >= 160 && !/\s/.test( decoded ) ? decoded : ''
		}

		pass_text() {
			return this.$.$giper_baza_auth.current().pass().toString()
		}

		account_switch( key: string ) {
			if( !key || key === this.account_key() ) return false
			const lord = this.$.$giper_baza_auth.current().pass().lord().str
			const pass = $giper_baza_auth.from( key ).pass()
			for( const land of this.lands_owned() ) land.give( pass, $giper_baza_rank_rule )
			this.$.$mol_state_local.value( 'bog_microtodo_merge', lord )
			this.$.$mol_state_local.value( '$giper_baza_auth', key )
			return true
		}

		account_found( next?: string ) {
			if( next ) this.account_enter( next )
			return ''
		}

		account_apply() {
			this.account_enter( this.account_input() )
		}

		account_enter( text: string ) {
			const key = this.account_key_of( text )
			if( !key ) return this.account_status( 'Это не ссылка и не ключ аккаунта' )
			if( !this.account_switch( key ) ) return this.account_status( 'Этот аккаунт уже здесь' )
			this.account_status( 'Входим…' )
			this.$.$mol_dom_context.location.reload()
		}

		@ $mol_mem
		account_import() {
			const arg = this.$.$mol_state_arg.value( 'account' )
			if( !arg ) return false
			const changed = this.account_switch( this.account_key_of( arg ) )
			this.$.$mol_state_arg.value( 'account', null )
			if( changed ) this.$.$mol_dom_context.location.reload()
			return changed
		}

	}

}
