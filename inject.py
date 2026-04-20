import os

def print_header():
    print("\n" + "="*40)
    print(" 👽 NULL_OS // PROJECT INJECTOR V2.0")
    print("="*40 + "\n")

def inject_project():
    print_header()
    
    # 1. get input
    title = input("> PROJECT_TITLE (ex: SYS.STYLOPHONE): ")
    icon = input("> ICON (ex: 🔊): ")
    sub = input("> SUBTITLE (ex: BJT Oscillator): ")
    status = input("> STATUS (ex: DONE / WIP): ")
    hw = input("> HARDWARE_SPECS: ")
    log = input("> NULL_LOG: ")
    vid = input("> VIDEO_URL (or type 'none'): ")
    doc = input("> DOC_URL (ex: doc_stylophone.html or 'none'): ")
    
    # 2. COMPILE HTML PAYLOAD WITH DATA ATTRIBUTES
    html_snippet = f"""
                        <div class="project-card" 
                            data-title="{title}" 
                            data-hw="{hw}" 
                            data-log="{log}" 
                            data-vid="{vid}" 
                            data-doc="{doc}" 
                            onclick="openModal(this)">
                            <div class="project-icon">{icon}</div>
                            <div class="project-info">
                                <h3>{title}</h3>
                                <p>{sub}</p>
                            </div>
                            <div class="project-status">{status}</div>
                        </div>
                        """
    
    # 3. INJECT
    file_path = "index.html"
    marker = "<!-- inject -->"
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        if marker not in content:
            print(f"\n[!] SYS_ERROR: Cannot find '{marker}' in {file_path}.")
            return
            
        replacement = html_snippet + "\n" + f"                        {marker}"
        content = content.replace(marker, replacement)
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
            
        print("\n[+] INJECTION SUCCESSFUL! Marker preserved for next time.\n")
        
    except FileNotFoundError:
        print(f"\n[!] SYS_ERROR: {file_path} not found in current directory.")

if __name__ == "__main__":
    inject_project()