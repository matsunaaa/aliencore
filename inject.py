import os

def print_header():
    print("\n" + "="*40)
    print(" 👽 NULL_OS // PROJECT INJECTOR V2.0")
    print("="*40 + "\n")

def inject_project():
    print_header()
    
    # 1. 获取你的输入
    title = input("> PROJECT_TITLE (ex: SYS.STYLOPHONE): ")
    icon = input("> ICON (ex: 🔊): ")
    sub = input("> SUBTITLE (ex: BJT Oscillator): ")
    status = input("> STATUS (ex: DONE / WIP): ")
    hw = input("> HARDWARE_SPECS: ")
    log = input("> NULL_LOG: ")
    vid = input("> VIDEO_URL (or type 'none'): ")
    
    # 2. 生成带 data-* 属性的 HTML 模块
    new_card = f"""
                        <div class="project-card" 
                            data-title="{title}" 
                            data-hw="{hw}" 
                            data-log="{log}" 
                            data-vid="{vid}" 
                            onclick="openModal(this)">
                            <div class="project-icon">{icon}</div>
                            <div class="project-info">
                                <h3>{title}</h3>
                                <p>{sub}</p>
                            </div>
                            <div class="project-status">{status}</div>
                        </div>"""
    
    # 3. 读取、注入、保存 index.html
    file_path = "index.html"
    marker = "<!-- inject -->"
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        if marker not in content:
            print(f"\n[!] SYS_ERROR: Cannot find '{marker}' in {file_path}.")
            return
            
        # 🌟 核心修复：把原有的 marker 替换成 "新卡片 + 换行 + 原有的 marker"
        # 这样 marker 就永远被推到了最底部，方便下次继续注入！
        replacement = new_card + "\n" + f"                        {marker}"
        content = content.replace(marker, replacement)
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
            
        print("\n[+] INJECTION SUCCESSFUL! Marker preserved for next time.\n")
        
    except FileNotFoundError:
        print(f"\n[!] SYS_ERROR: {file_path} not found in current directory.")

if __name__ == "__main__":
    inject_project()