export default function asDefaultProps<P>(component: { prototype: { props: P } }) {
    return <DP extends Partial<P>>(defaultProps: DP) => defaultProps;
}