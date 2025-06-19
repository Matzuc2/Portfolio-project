export default function Profile() {
    return (
      <>
        <input type="text" name="q" placeholder="Search..." list="suggestions" />
        <datalist id="suggestions">
          <option value="Keyword 1" />
          <option value="Keyword 2" />
          <option value="Keyword 3" />
        </datalist>
      </>
    )
}