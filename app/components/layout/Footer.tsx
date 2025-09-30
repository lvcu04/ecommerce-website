const Footer = () => {
  return (
    <footer className="border-t border-border mt-12 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} FASHION. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;