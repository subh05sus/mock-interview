function Footer() {
  return (
    <footer className="bg-zinc-800 text-white py-4">
      <div className="container mx-auto text-center">
        <p>
          &copy; {new Date().getFullYear()} Your Jobsforce.ai. All rights
          reserved.
        </p>
        <p>Made By Subhadip Saha</p>
      </div>
    </footer>
  );
}

export default Footer;
