namespace $.$$ {

	export class $bog_microtodo_row extends $.$bog_microtodo_row {

		task() {
			return this.$.$giper_baza_glob.Pawn( new $giper_baza_link( this.link() ), $bog_microtodo_task )
		}

		title() {
			return this.task().Title()?.val() ?? ''
		}

		important( next?: boolean ) {
			return this.task().Important( next === undefined ? undefined : 'auto' )?.val( next ) ?? false
		}

		@ $mol_mem
		steps_label() {
			const steps = this.task().Steps()?.items() ?? []
			if( !steps.length ) return ''
			const done = steps.filter( link => this.$.$giper_baza_glob.Pawn( link, $bog_microtodo_step ).Done()?.val() ).length
			return `${ done } из ${ steps.length }`
		}

		@ $mol_mem
		meta_text() {
			const task = this.task()
			return [
				this.list_title(),
				this.myday() ? 'Мой день' : '',
				$bog_microtodo_due_label( task.Due()?.val() ?? '' ),
				task.Repeat()?.val() ? '↻' : '',
				this.steps_label(),
				task.Note()?.val() ? '✎' : '',
			].filter( Boolean ).join( ' · ' )
		}

		meta() {
			return this.meta_text() ? [ this.Meta_text() ] : []
		}

		@ $mol_mem
		overdue() {
			const due = this.task().Due()?.val() ?? ''
			return Boolean( due ) && !this.done() && due < $bog_microtodo_day()
		}

	}

}
