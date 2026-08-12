import LocalePage from './[locale]/page'

export default function Page() {
 return <LocalePage params={Promise.resolve({ locale: 'it' })} />
}
