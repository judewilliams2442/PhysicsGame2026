
import tkinter as tk
from tkinter import ttk
import random

class PhysicsGameGUI(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Physics Strategy Game")
        self.geometry("800x600")
        self.configure(bg="#2E2E2E")  # Dark background

        # Dark theme configuration for ttk widgets
        self.style = ttk.Style()
        self.style.theme_use("clam")  # Clam theme is a good base for dark mode
        self.style.configure(".", background="#2E2E2E", foreground="#E0E0E0", font=("Arial", 10))
        self.style.configure("TFrame", background="#2E2E2E")
        self.style.configure("TLabel", background="#2E2E2E", foreground="#E0E0E0")
        self.style.configure("TButton", background="#505050", foreground="#E0E0E0", relief="flat")
        self.style.map("TButton", background=[("active", "#707070")])
        self.style.configure("TEntry", fieldbackground="#404040", foreground="#E0E0E0", insertbackground="#E0E0E0")

        self.variables = {
            "F": (1, 100), "m": (1, 50), "x": (0, 100), "v": (0, 50), "t": (1, 20), "a": (0, 10),
            "p": (1, 100), "K": (1, 100), "v0": (0, 50), "I": (1, 100), "ω": (0, 20), "T": (1, 10),
            "f": (1, 10), "Krot": (1, 100), "ω0": (0, 20), "αrot": (0, 10)
        }
        self.variable_labels = {}
        
        self.player_data = {
            "player1": {"status": tk.StringVar(value="Waiting"), "score": tk.IntVar(value=0), "result_entry": None, "result_value": tk.StringVar()},
            "player2": {"status": tk.StringVar(value="Waiting"), "score": tk.IntVar(value=0), "result_entry": None, "result_value": tk.StringVar()}
        }

        self.player1_vote = None
        self.player2_vote = None
        self.vote_outcome_message = tk.StringVar()
        self.round_winner_message = tk.StringVar(value="")
        self.game_state = "idle" # "idle", "round_active", "round_ended"

        self.create_widgets()
        self._update_ui_state() # Initial UI state update

    def create_widgets(self):
        # Main frames for layout
        self.top_frame = ttk.Frame(self, padding="10", relief="groove", borderwidth=2)
        self.top_frame.pack(side=tk.TOP, fill=tk.X, pady=5, padx=5)

        self.center_frame = ttk.Frame(self, padding="10", relief="groove", borderwidth=2)
        self.center_frame.pack(side=tk.TOP, fill=tk.BOTH, expand=True, pady=5, padx=5)

        self.bottom_frame = ttk.Frame(self, padding="10", relief="groove", borderwidth=2)
        self.bottom_frame.pack(side=tk.BOTTOM, fill=tk.X, pady=5, padx=5)

        self.create_variable_board()
        self.create_player_panels()
        self.create_voting_system()
        self.create_round_controls()
        # Placeholder for now, will be populated in subsequent steps
        # ttk.Label(self.top_frame, text="Variable Board (Top Panel)").pack()
        # ttk.Label(self.center_frame, text="Player Status (Center Panel)").pack()
        # ttk.Label(self.bottom_frame, text="Hidden Voting & Controls (Bottom Panel)").pack()

    def create_variable_board(self):
        variable_header = ttk.Label(self.top_frame, text="-- Variable Board --", font=("Arial", 12, "bold"))
        variable_header.pack(pady=5)

        var_display_frame = ttk.Frame(self.top_frame)
        var_display_frame.pack(pady=5)

        # Display variables in a grid-like format
        col = 0
        row = 0
        for var_name, _ in self.variables.items():
            label_text = tk.StringVar()
            self.variable_labels[var_name] = label_text

            var_label = ttk.Label(var_display_frame, textvariable=label_text, width=10, anchor="w")
            var_label.grid(row=row, column=col, padx=5, pady=2, sticky="w")
            col += 1
            if col > 5:  # Max 6 variables per row
                col = 0
                row += 1
        
        self.reroll_variables_button = ttk.Button(self.top_frame, text="Reroll Variables", command=self.reroll_variables)
        self.reroll_variables_button.pack(pady=5)
         
        self.reroll_variables() # Set initial values

    def create_player_panels(self):
        player_panels_frame = ttk.Frame(self.center_frame)
        player_panels_frame.pack(expand=True, fill=tk.BOTH, pady=10)

        player_header = ttk.Label(self.center_frame, text="-- Player Status --", font=("Arial", 12, "bold"))
        player_header.pack(pady=5)

        for i, player_id in enumerate(["player1", "player2"]):
            player_frame = ttk.Frame(player_panels_frame, relief="solid", borderwidth=1, padding=10)
            player_frame.pack(side=tk.LEFT, expand=True, fill=tk.BOTH, padx=10)

            ttk.Label(player_frame, text=f"Player {i+1}", font=("Arial", 12, "bold")).pack(pady=5)

            # Status
            ttk.Label(player_frame, text="Status:").pack(anchor="w")
            ttk.Label(player_frame, textvariable=self.player_data[player_id]["status"], font=("Arial", 10, "italic")).pack(anchor="w")

            # Score
            ttk.Label(player_frame, text="Score:").pack(anchor="w", pady=(10,0))
            ttk.Label(player_frame, textvariable=self.player_data[player_id]["score"], font=("Arial", 14, "bold")).pack(anchor="w")

            # Result Input
            ttk.Label(player_frame, text="Final Result:").pack(anchor="w", pady=(10,0))
            result_entry = ttk.Entry(player_frame, textvariable=self.player_data[player_id]["result_value"], width=20)
            result_entry.pack(anchor="w", pady=5)
            self.player_data[player_id]["result_entry"] = result_entry

    def create_voting_system(self):
        voting_header = ttk.Label(self.bottom_frame, text="-- Hidden Voting --", font=("Arial", 12, "bold"))
        voting_header.pack(pady=5)

        voting_frame = ttk.Frame(self.bottom_frame)
        voting_frame.pack(pady=5)

        # Player 1 Voting
        player1_vote_frame = ttk.Frame(voting_frame, relief="solid", borderwidth=1, padding=5)
        player1_vote_frame.pack(side=tk.LEFT, padx=10)
        ttk.Label(player1_vote_frame, text="Player 1 Vote").pack()
        self.p1_draw_button = ttk.Button(player1_vote_frame, text="DRAW", command=lambda: self.record_vote("player1", "DRAW"))
        self.p1_draw_button.pack(side=tk.LEFT, padx=5, pady=5)
        self.p1_stop_button = ttk.Button(player1_vote_frame, text="STOP", command=lambda: self.record_vote("player1", "STOP"))
        self.p1_stop_button.pack(side=tk.LEFT, padx=5, pady=5)

        # Player 2 Voting
        player2_vote_frame = ttk.Frame(voting_frame, relief="solid", borderwidth=1, padding=5)
        player2_vote_frame.pack(side=tk.RIGHT, padx=10)
        ttk.Label(player2_vote_frame, text="Player 2 Vote").pack()
        self.p2_draw_button = ttk.Button(player2_vote_frame, text="DRAW", command=lambda: self.record_vote("player2", "DRAW"))
        self.p2_draw_button.pack(side=tk.LEFT, padx=5, pady=5)
        self.p2_stop_button = ttk.Button(player2_vote_frame, text="STOP", command=lambda: self.record_vote("player2", "STOP"))
        self.p2_stop_button.pack(side=tk.LEFT, padx=5, pady=5)

        # Voting Outcome Banner
        self.outcome_banner = ttk.Label(self.bottom_frame, textvariable=self.vote_outcome_message, font=("Arial", 12, "bold"), foreground="#FFD700")
        self.outcome_banner.pack(pady=10)
        self.vote_outcome_message.set("Waiting for votes...")

    def create_round_controls(self):
        control_frame = ttk.Frame(self.bottom_frame, padding="10", relief="groove", borderwidth=2)
        control_frame.pack(side=tk.BOTTOM, fill=tk.X, pady=5, padx=5)

        ttk.Label(control_frame, text="-- Round Controls --", font=("Arial", 12, "bold")).pack(pady=5)

        button_frame = ttk.Frame(control_frame)
        button_frame.pack(pady=5)

        self.start_round_button = ttk.Button(button_frame, text="Start Round", command=self.start_round)
        self.start_round_button.pack(side=tk.LEFT, padx=5)
        self.end_round_button = ttk.Button(button_frame, text="End Round", command=self.end_round)
        self.end_round_button.pack(side=tk.LEFT, padx=5)
        self.reset_game_button = ttk.Button(button_frame, text="Reset Game", command=self.reset_game)
        self.reset_game_button.pack(side=tk.LEFT, padx=5)

        self.reroll_toggle = tk.BooleanVar(value=True)
        self.reroll_toggle_checkbutton = ttk.Checkbutton(button_frame, text="Reroll variables on Start Round", variable=self.reroll_toggle)
        self.reroll_toggle_checkbutton.pack(side=tk.LEFT, padx=10)

        self.winner_display_label = ttk.Label(control_frame, textvariable=self.round_winner_message, font=("Arial", 14, "bold"), foreground="#00FF00")
        self.winner_display_label.pack(pady=10)

    def start_round(self):
        if self.game_state != "round_active":
            self.game_state = "round_active"
            self.reset_votes()
            self.round_winner_message.set("") # Clear winner message
            for player_id in ["player1", "player2"]:
                self.player_data[player_id]["status"].set("Voting")
                self.player_data[player_id]["result_value"].set("") # Clear previous result

            if self.reroll_toggle.get():
                self.reroll_variables()
            self.vote_outcome_message.set("Waiting for votes...")
            print("Round Started")
            self._update_ui_state()

    def end_round(self):
        if self.game_state == "round_active":
            self.game_state = "round_ended"
            for player_id in ["player1", "player2"]:
                self.player_data[player_id]["status"].set("Locked")
            self.compare_results() # Call scoring system here
            print("Round Ended")
            self._update_ui_state()

    def reset_game(self):
        self.game_state = "idle"
        self.reset_votes()
        self.reroll_variables()
        self.round_winner_message.set("")
        for player_id in ["player1", "player2"]:
            self.player_data[player_id]["status"].set("Waiting")
            self.player_data[player_id]["score"].set(0)
            self.player_data[player_id]["result_value"].set("")
        self.vote_outcome_message.set("Waiting for votes...")
        print("Game Reset")
        self._update_ui_state()

    def compare_results(self):
        try:
            p1_result = float(self.player_data["player1"]["result_value"].get())
            p2_result = float(self.player_data["player2"]["result_value"].get())

            if p1_result > p2_result:
                winner = "Player 1"
                self.player_data["player1"]["score"].set(self.player_data["player1"]["score"].get() + 1)
            elif p2_result > p1_result:
                winner = "Player 2"
                self.player_data["player2"]["score"].set(self.player_data["player2"]["score"].get() + 1)
            else:
                winner = "It's a Tie!"
            
            self.round_winner_message.set(f"Round Winner: {winner}")
            print(f"Round Winner: {winner}")

        except ValueError:
            self.round_winner_message.set("Invalid result input!")
            print("Invalid result input!")

    def record_vote(self, player_id, vote):
        if player_id == "player1":
            self.player1_vote = vote
            self.player_data[player_id]["status"].set("Voted")
        elif player_id == "player2":
            self.player2_vote = vote
            self.player_data[player_id]["status"].set("Voted")
        
        self._update_ui_state()

        if self.player1_vote and self.player2_vote:
            self.reveal_vote_outcome()

    def reveal_vote_outcome(self):
        if self.player1_vote == "DRAW" and self.player2_vote == "DRAW":
            self.vote_outcome_message.set("Outcome: Continue Round")
        else:
            self.vote_outcome_message.set("Outcome: Round Ends")
        # Reset votes after revealing outcome, or manage state as needed for round control
        # self.reset_votes() # This will be handled by round control

    def reset_votes(self):
        self.player1_vote = None
        self.player2_vote = None
        self.vote_outcome_message.set("Waiting for votes...")
        self.player_data["player1"]["status"].set("Waiting")
        self.player_data["player2"]["status"].set("Waiting")
        self._update_ui_state() # Update UI state after resetting votes

    def reroll_variables(self):
        for var_name, (min_val, max_val) in self.variables.items():
            # For now, generating integers. Can be expanded to floats later.
            value = random.randint(min_val, max_val)
            self.variable_labels[var_name].set(f"{var_name}: {value}")

    def _update_ui_state(self):
        # Enable/disable widgets based on game_state
        if self.game_state == "idle":
            self.start_round_button.config(state=tk.NORMAL)
            self.reroll_variables_button.config(state=tk.NORMAL)
            self.end_round_button.config(state=tk.DISABLED)
            self.reset_game_button.config(state=tk.NORMAL)
            self.reroll_toggle_checkbutton.config(state=tk.NORMAL)
            self.p1_draw_button.config(state=tk.DISABLED)
            self.p1_stop_button.config(state=tk.DISABLED)
            self.p2_draw_button.config(state=tk.DISABLED)
            self.p2_stop_button.config(state=tk.DISABLED)
            for player_id in ["player1", "player2"]:
                self.player_data[player_id]["result_entry"].config(state=tk.DISABLED)

        elif self.game_state == "round_active":
            self.start_round_button.config(state=tk.DISABLED)
            self.reroll_variables_button.config(state=tk.DISABLED)
            self.end_round_button.config(state=tk.NORMAL)
            self.reset_game_button.config(state=tk.NORMAL)
            self.reroll_toggle_checkbutton.config(state=tk.DISABLED)
            
            # Voting buttons
            self.p1_draw_button.config(state=tk.NORMAL if not self.player1_vote else tk.DISABLED)
            self.p1_stop_button.config(state=tk.NORMAL if not self.player1_vote else tk.DISABLED)
            self.p2_draw_button.config(state=tk.NORMAL if not self.player2_vote else tk.DISABLED)
            self.p2_stop_button.config(state=tk.NORMAL if not self.player2_vote else tk.DISABLED)

            for player_id in ["player1", "player2"]:
                self.player_data[player_id]["result_entry"].config(state=tk.NORMAL)

        elif self.game_state == "round_ended":
            self.start_round_button.config(state=tk.NORMAL)
            self.reroll_variables_button.config(state=tk.DISABLED)
            self.end_round_button.config(state=tk.DISABLED)
            self.reset_game_button.config(state=tk.NORMAL)
            self.reroll_toggle_checkbutton.config(state=tk.NORMAL)
            self.p1_draw_button.config(state=tk.DISABLED)
            self.p1_stop_button.config(state=tk.DISABLED)
            self.p2_draw_button.config(state=tk.DISABLED)
            self.p2_stop_button.config(state=tk.DISABLED)
            for player_id in ["player1", "player2"]:
                self.player_data[player_id]["result_entry"].config(state=tk.DISABLED)

if __name__ == "__main__":
    app = PhysicsGameGUI()
    app.mainloop()
